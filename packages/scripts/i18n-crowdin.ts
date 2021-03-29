/* eslint-disable jsdoc/require-param */
/* eslint-env node */

import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import util from 'util';

import axios from 'axios';
import JSON5 from 'json5';
import Crowdin, { SourceFilesModel } from '@crowdin/crowdin-api-client';
import ProgressBar from 'progress';
import ch from 'chalk';
import iso639 from 'iso-639-1';
import { prompt, DistinctQuestion } from 'inquirer';

import git from 'git-rev-sync';

import { crowdin as config } from './../../config';

if (!config.apiKey) {
    console.error(ch.red`crowdinApiKey is required`);
    process.exit(126);
}

const PROJECT_ID = config.projectId;
const CROWDIN_FILE_PATH = config.filePath;
const SOURCE_LANG = config.sourceLang;
const LANG_DIR = config.basePath;
const INDEX_FILE_NAME = 'index.js';
const MIN_RELEASE_PROGRESS = config.minTranslated;

const crowdin = new Crowdin({
    token: config.apiKey,
});

/**
 * Locales that has been verified by core team members
 */
const releasedLocales: ReadonlyArray<string> = ['be', 'fr', 'id', 'pt', 'ru', 'uk', 'vi', 'zh'];

/**
 * Map Crowdin locales into our internal locales representation
 */
const LOCALES_MAP: Record<string, string> = {
    'es-ES': 'es',
    'pt-BR': 'pt',
    'zh-CN': 'zh',
};

/**
 * This array allows us to customise native languages names,
 * because ISO-639-1 sometimes is strange
 */
const NATIVE_NAMES_MAP: Record<string, string> = {
    be: 'Беларуская',
    cs: 'Čeština',
    fil: 'Wikang Filipino',
    id: 'Bahasa Indonesia',
    lt: 'Lietuvių',
    pl: 'Polski',
    pt: 'Português do Brasil',
    sr: 'Српски',
    ro: 'Română',
    udm: 'Удмурт',
    zh: '简体中文',
};

/**
 * This arrays allows us to override Crowdin English languages names
 */
const ENGLISH_NAMES_MAP: Record<string, string> = {
    fil: 'Filipino',
    pt: 'Portuguese, Brazilian',
    sr: 'Serbian',
    udm: 'Udmurt',
    zh: 'Simplified Chinese',
};

/**
 * Converts Crowdin's language code to our internal value
 */
function toInternalLocale(code: string): string {
    return LOCALES_MAP[code] || code;
}

/**
 * Formats the incoming hash with the translations in the module string in the format
 * as they are stored in the application itself
 */
function serializeToModule(translates: Record<string, any>): string {
    const src = JSON5.stringify(sortByKeys(translates), null, 4);

    return `export default ${src};\n`;
}

// http://stackoverflow.com/a/29622653/5184751
function sortByKeys<T extends Record<string, any>>(object: T): T {
    return Object.keys(object)
        .sort()
        .reduce((result, key) => {
            // @ts-ignore
            result[key] = object[key];

            return result;
        }, {} as T);
}

interface IndexFileEntry {
    code: string;
    name: string;
    englishName: string;
    progress: number;
    isReleased: boolean;
}

function getLocaleFilePath(languageId: string): string {
    return path.join(LANG_DIR, `${toInternalLocale(languageId)}.json`);
}

async function findDirectoryId(directoryPath: string, branchId?: number): Promise<number | undefined> {
    const { data: dirsResponse } = await crowdin.sourceFilesApi.listProjectDirectories(PROJECT_ID, branchId);
    const dirs = dirsResponse.map((dirData) => dirData.data);

    const result = directoryPath.split('/').reduce((parentDir, dirName) => {
        // directoryId is nullable when a directory has no parent
        return dirs.find((dir) => dir.directoryId === parentDir && dir.name === dirName)?.id;
    }, null as number | null | undefined);

    return result || undefined;
}

async function findFileId(filePath: string, branchId?: number): Promise<number | undefined> {
    const fileName = path.basename(filePath);
    const dirPath = path.dirname(filePath);
    let directoryId: number | null = null;

    if (dirPath !== '') {
        directoryId = (await findDirectoryId(dirPath, branchId)) || null;
    }

    // When the branchId and directoryId aren't specified the list returned recursively,
    // but if one of this param is specified, the list contains only the specified parent.
    //
    // Directories ids for each branch are different, so directoryId is already ensures
    // that the file will be searched in the correct branch
    const { data: filesResponse } = await crowdin.sourceFilesApi.listProjectFiles(
        PROJECT_ID,
        directoryId === null ? branchId : undefined,
        directoryId || undefined, // directory ID can't be 0, but can be null
    );
    const files = filesResponse.map((fileData) => fileData.data);

    // Compare directoryId since when the file is placed in the root
    return files.find((file) => file.directoryId === directoryId && file.name === fileName)?.id;
}

async function findBranchId(branchName: string): Promise<number | undefined> {
    const { data: branchesList } = await crowdin.sourceFilesApi.listProjectBranches(PROJECT_ID, branchName);
    const branchData = branchesList.find(({ data: branch }) => branch.name === branchName);

    return branchData?.data.id;
}

async function ensureDirectory(dirPath: string, branchId?: number): Promise<number> {
    const { data: dirsResponse } = await crowdin.sourceFilesApi.listProjectDirectories(PROJECT_ID, branchId);
    const dirs = dirsResponse.map((dirData) => dirData.data);

    return dirPath.split('/').reduce(async (parentDirPromise, name) => {
        const parentDir = await parentDirPromise;
        const directoryId = dirs.find((dir) => dir.directoryId === parentDir && dir.name === name)?.id;

        if (directoryId) {
            return directoryId;
        }

        const createDirRequest: SourceFilesModel.CreateDirectoryRequest = { name };

        if (directoryId) {
            createDirRequest['directoryId'] = directoryId;
        } else if (branchId) {
            createDirRequest['branchId'] = branchId;
        }

        const dirResponse = await crowdin.sourceFilesApi.createDirectory(PROJECT_ID, createDirRequest);

        return dirResponse.data.id;
        // @ts-ignore
    }, Promise.resolve<number>(null));
}

function getGitBranch(): string {
    if (process.env.CI_COMMIT_BRANCH) {
        return process.env.CI_COMMIT_BRANCH;
    }

    const branch = git.branch();

    if (branch.startsWith('Detached')) {
        throw new Error(`Cannot automatically detect git branch. Received "${branch}"`);
    }

    return branch;
}

async function pull(): Promise<void> {
    const branchName = getGitBranch();
    const isMasterBranch = branchName === 'master';
    let branchId: number | undefined;

    if (!isMasterBranch) {
        console.log(
            [
                `Current branch isn't ${chalk.green('master')},`,
                `will try to pull translates from the ${chalk.green(branchName)} branch`,
            ].join(' '),
        );
        branchId = await findBranchId(branchName);

        if (!branchId) {
            console.log(`Branch ${chalk.green(branchName)} isn't found, will use ${chalk.green('master')} instead`);
        }
    }

    console.log('Loading file info...');
    const fileId = await findFileId(CROWDIN_FILE_PATH, branchId);

    if (!fileId) {
        throw new Error('Cannot find the file');
    }

    console.log('Pulling translation progress...');
    const { data: fileProgress } = await crowdin.translationStatusApi.getFileProgress(PROJECT_ID, fileId, 100);

    const localesToPull: Array<string> = [];
    const indexFileEntries: Record<string, IndexFileEntry> = {
        en: {
            code: 'en',
            name: 'English',
            englishName: 'English',
            progress: 100,
            isReleased: true,
        },
    };

    fileProgress.forEach(({ data: { languageId, translationProgress } }) => {
        const locale = toInternalLocale(languageId);

        if (releasedLocales.includes(locale) || translationProgress >= MIN_RELEASE_PROGRESS) {
            localesToPull.push(languageId);
            indexFileEntries[locale] = {
                code: locale,
                name: NATIVE_NAMES_MAP[locale] || iso639.getNativeName(locale),
                englishName: ENGLISH_NAMES_MAP[locale] || iso639.getName(locale),
                progress: translationProgress,
                isReleased: releasedLocales.includes(locale),
            };
        }
    });

    // Add prefix 'c' to current and total to prevent filling thees placeholders with real values
    const downloadingProgressBar = new ProgressBar('Downloading translates :bar :percent | :cCurrent/:total', {
        total: localesToPull.length,
        incomplete: '\u2591',
        complete: '\u2588',
        width: Object.keys(indexFileEntries).length - 1,
    });
    let downloadingReady = 0;

    const promises = localesToPull.map(
        async (languageId): Promise<void> => {
            const {
                data: { url },
            } = await crowdin.translationsApi.buildProjectFileTranslation(PROJECT_ID, fileId, {
                targetLanguageId: languageId,
            });

            const { data: fileContents } = await axios.get(url, {
                // Disable response parsing
                transformResponse: [],
            });
            fs.writeFileSync(getLocaleFilePath(languageId), fileContents);

            downloadingProgressBar.update(++downloadingReady / localesToPull.length, {
                cCurrent: downloadingReady,
            });
        },
    );

    await Promise.all(promises);

    console.log('Writing an index file');

    fs.writeFileSync(path.join(LANG_DIR, INDEX_FILE_NAME), serializeToModule(indexFileEntries));

    console.log(ch.green('The index file was successfully written'));
}

async function push(): Promise<void> {
    if (!fs.existsSync(getLocaleFilePath(SOURCE_LANG))) {
        console.error(
            chalk.red(
                `File for the source language doesn't exists. Run ${chalk.green(
                    'yarn i18n:extract',
                )} to generate the source language file.`,
            ),
        );

        return;
    }

    const questions: Array<DistinctQuestion> = [
        {
            name: 'disapproveTranslates',
            type: 'confirm',
            default: true,
            message: 'Disapprove changed lines?',
        },
    ];

    const branchName = getGitBranch();
    const isMasterBranch = branchName === 'master';

    if (!isMasterBranch) {
        questions.push({
            name: 'publishInBranch',
            type: 'confirm',
            default: true,
            message: `Should be strings published in its own branch [${chalk.green(branchName)}]?`,
        });
    }

    let disapproveTranslates = true;
    let publishInBranch = !isMasterBranch;
    try {
        const answers = await prompt(questions);
        disapproveTranslates = answers[0]; // eslint-disable-line prefer-destructuring
        publishInBranch = answers[1] || false;
    } catch (err) {
        // okay if it's a tty error
        if (!err.isTtyError) {
            throw err;
        }
    }

    let branchId: number | undefined;

    if (publishInBranch) {
        console.log('Loading the branch info...');
        branchId = await findBranchId(branchName);

        if (!branchId) {
            console.log("Branch doesn't exists. Creating...");
            const { data: branchResponse } = await crowdin.sourceFilesApi.createBranch(PROJECT_ID, {
                name: branchName,
            });
            branchId = branchResponse.id;
        }
    }

    console.log('Loading the file info...');
    const fileId = await findFileId(CROWDIN_FILE_PATH, branchId);
    let dirId: number | undefined;

    if (!fileId) {
        const dirPath = path.dirname(CROWDIN_FILE_PATH);

        if (dirPath !== '') {
            console.log('Ensuring necessary directories structure...');
            dirId = await ensureDirectory(dirPath, branchId);
        }
    }

    console.log('Uploading the source file to the storage...');
    const { data: storageResponse } = await crowdin.uploadStorageApi.addStorage(
        path.basename(CROWDIN_FILE_PATH),
        fs.readFileSync(getLocaleFilePath(SOURCE_LANG)),
    );

    if (fileId) {
        console.log(`Applying the new revision...`);
        await crowdin.sourceFilesApi.updateOrRestoreFile(PROJECT_ID, fileId, {
            storageId: storageResponse.id,
            updateOption: disapproveTranslates
                ? SourceFilesModel.UpdateOption.CLEAR_TRANSLATIONS_AND_APPROVALS
                : SourceFilesModel.UpdateOption.KEEP_TRANSLATIONS_AND_APPROVALS,
        });
    } else {
        console.log(`Uploading the file...`);
        const createFileRequest: SourceFilesModel.CreateFileRequest = {
            storageId: storageResponse.id,
            name: path.basename(CROWDIN_FILE_PATH),
        };

        if (dirId) {
            createFileRequest['directoryId'] = dirId;
        } else if (branchId) {
            createFileRequest['branchId'] = branchId;
        }

        await crowdin.sourceFilesApi.createFile(PROJECT_ID, createFileRequest);
    }

    console.log(ch.green('Success'));
}

(async () => {
    try {
        const action = process.argv[2]; // eslint-disable-line prefer-destructuring

        switch (action) {
            case 'pull':
                await pull();
                break;
            case 'push':
                await push();
                break;
            default:
                console.error(`Unknown action ${action}`);
        }
    } catch (exception) {
        console.error(util.inspect(exception, { depth: null }));
        process.exit(1);
    }
})();
