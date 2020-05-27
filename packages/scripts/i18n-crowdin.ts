/* eslint-env node */
/* eslint-disable */

import fs from 'fs';
import path from 'path';

import axios from 'axios';
import JSON5 from 'json5';
import Crowdin, { SourceFilesModel } from '@crowdin/crowdin-api-client';
import ProgressBar from 'progress';
import ch from 'chalk';
import iso639 from 'iso-639-1';
import { prompt } from 'inquirer';

import config from './../../config';

if (!config.crowdin.apiKey) {
    console.error(ch.red`crowdinApiKey is required`);
    process.exit(126);
}

const PROJECT_ID = config.crowdin.projectId;
const CROWDIN_FILE_PATH = config.crowdin.filePath;
const SOURCE_LANG = config.crowdin.sourceLang;
const LANG_DIR = config.crowdin.basePath;
const INDEX_FILE_NAME = 'index.js';
const MIN_RELEASE_PROGRESS = config.crowdin.minApproved;

const crowdin = new Crowdin({
    token: config.crowdin.apiKey,
});

/**
 * Locales that has been verified by core team members
 */
const releasedLocales: ReadonlyArray<string> = ['be', 'fr', 'id', 'pt', 'ru', 'uk', 'vi', 'zh'];

/**
 * Map Crowdin locales into our internal locales representation
 */
const LOCALES_MAP: Record<string, string> = {
    'pt-BR': 'pt',
    'zh-CN': 'zh',
};

/**
 * This array allows us to customise native languages names,
 * because ISO-639-1 sometimes is strange
 */
const NATIVE_NAMES_MAP: Record<string, string> = {
    be: 'Беларуская',
    id: 'Bahasa Indonesia',
    lt: 'Lietuvių',
    pl: 'Polski',
    pt: 'Português do Brasil',
    sr: 'Српски',
    ro: 'Română',
    zh: '简体中文',
};

/**
 * This arrays allows us to override Crowdin English languages names
 */
const ENGLISH_NAMES_MAP: Record<string, string> = {
    pt: 'Portuguese, Brazilian',
    sr: 'Serbian',
    zh: 'Simplified Chinese',
};

/**
 * Converts Crowdin's language code to our internal value
 */
function toInternalLocale(code: string): string {
    return LOCALES_MAP[code] || code;
}

/**
 * Форматирует входящий объект с переводами в итоговую строку в том формате, в каком они
 * хранятся в самом приложении
 */
function serializeToModule(translates: Record<string, any>): string {
    const src = JSON5.stringify(sortByKeys(translates), null, 4);

    return `module.exports = ${src};\n`;
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

let directoriesList: Array<SourceFilesModel.Directory>;
let filesList: Array<SourceFilesModel.File>;

async function findFileId(path: string, parentDir: number|null = null): Promise<number> {
    const [nodeToSearch, ...rest] = path.split('/');
    if (rest.length === 0) {
        if (!filesList) {
            const { data: filesResponse } = await crowdin.sourceFilesApi.listProjectFiles(PROJECT_ID);
            filesList = filesResponse.map((fileData) => fileData.data);
        }

        const file = filesList.find((file) => file.directoryId === parentDir && file.name === nodeToSearch);
        if (file === undefined) {
            throw new Error('Cannot find file by provided path');
        }

        return file.id;
    }

    if (!directoriesList) {
        const { data: dirsResponse } = await crowdin.sourceFilesApi.listProjectDirectories(PROJECT_ID);
        directoriesList = dirsResponse.map((dirData) => dirData.data);
    }

    const dir = directoriesList.find((dir) => dir.directoryId === parentDir && dir.name === nodeToSearch);
    if (dir === undefined) {
        throw new Error('Cannot find directory by provided path');
    }

    return findFileId(rest.join('/'), dir.id);
}

async function pull(): Promise<void> {
    console.log('Loading file info...');
    const fileId = await findFileId(CROWDIN_FILE_PATH);

    console.log('Pulling translation progress...');
    const { data: translationProgress } = await crowdin.translationStatusApi.getFileProgress(PROJECT_ID, fileId, 100);

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

    translationProgress.forEach(({ data: { languageId, approvalProgress } }) => {
        const locale = toInternalLocale(languageId);
        if (releasedLocales.includes(locale) || approvalProgress >= MIN_RELEASE_PROGRESS) {
            localesToPull.push(languageId);
            indexFileEntries[locale] = {
                code: locale,
                name: NATIVE_NAMES_MAP[locale] || iso639.getNativeName(locale),
                englishName: ENGLISH_NAMES_MAP[locale] || iso639.getName(locale),
                progress: approvalProgress,
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

    const promises = localesToPull.map(async (languageId): Promise<void> => {
        const { data: { url } } = await crowdin.translationsApi.buildProjectFileTranslation(PROJECT_ID, fileId, {
            targetLanguageId: languageId,
            exportApprovedOnly: true,
        });

        const { data: fileContents } = await axios.get(url, {
            // Disable response parsing
            transformResponse: [],
        });
        fs.writeFileSync(getLocaleFilePath(languageId), fileContents);

        downloadingProgressBar.update(++downloadingReady / localesToPull.length, {
            cCurrent: downloadingReady,
        });
    });

    await Promise.all(promises);

    console.log('Writing an index file');

    fs.writeFileSync(path.join(LANG_DIR, INDEX_FILE_NAME), serializeToModule(indexFileEntries));

    console.log(ch.green('The index file was successfully written'));
}

async function push(): Promise<void> {
    const { disapproveTranslates } = await prompt([{
        name: 'disapproveTranslates',
        type: 'confirm',
        default: true,
        message: 'Disapprove changed lines?',
    }]);

    console.log('Loading file info...');
    const fileId = await findFileId(CROWDIN_FILE_PATH);

    console.log('Uploading the source file to the storage...')
    const { data: { id: storageId } } = await crowdin.uploadStorageApi.addStorage(
        path.basename(CROWDIN_FILE_PATH),
        fs.readFileSync(getLocaleFilePath(SOURCE_LANG)),
    );

    console.log(`Applying the new revision...`);
    await crowdin.sourceFilesApi.updateOrRestoreFile(PROJECT_ID, fileId, {
        storageId,
        updateOption: disapproveTranslates
            ? SourceFilesModel.UpdateOption.CLEAR_TRANSLATIONS_AND_APPROVALS
            : SourceFilesModel.UpdateOption.KEEP_TRANSLATIONS_AND_APPROVALS,
    });

    console.log(ch.green('Success'));
}

try {
    const action = process.argv[2];

    switch (action) {
        case 'pull':
            pull();
            break;
        case 'push':
            push();
            break;
        default:
            console.error(`Unknown action ${action}`);
    }
} catch (exception) {
    console.error(exception);
}
