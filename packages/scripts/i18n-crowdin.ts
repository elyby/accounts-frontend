/* eslint-env node */
/* eslint-disable */

import fs from 'fs';
import path from 'path';
import CrowdinApi, { LanguageStatusNode, LanguageStatusResponse, ProjectInfoResponse } from 'crowdin-api';
import MultiProgress from 'multi-progress';
import ch from 'chalk';
import iso639 from 'iso-639-1';
import prompt from 'prompt';

import { ValuesType } from 'utility-types';

import config from '../../config';

if (!config.crowdinApiKey) {
    console.error(ch.red`crowdinApiKey is required`);
    process.exit(126);
}

const PROJECT_ID = 'elyby';
const PROJECT_KEY = config.crowdinApiKey;
const CROWDIN_FILE_PATH = 'accounts/site.json';
const SOURCE_LANG = 'en';
const LANG_DIR = path.resolve(`${__dirname}/../app/i18n`);
const INDEX_FILE_NAME = 'index.js';
const MIN_RELEASE_PROGRESS = 80; // Minimal ready percent before translation can be published

const crowdin = new CrowdinApi({
    apiKey: PROJECT_KEY,
    projectName: PROJECT_ID,
});
const progressBar = new MultiProgress();

/**
 * Locales that has been verified by core team members
 */
const RELEASED_LOCALES: Array<string> = ['be', 'fr', 'id', 'pt', 'ru', 'uk', 'vi', 'zh'];

/**
 * Array of Crowdin locales to our internal locales representation
 */
const LOCALES_MAP: Record<string, string> = {
    'pt-BR': 'pt',
    'zh-CN': 'zh',
};

/**
 * This array allows us to customise native languages names, because ISO-639-1 sometimes is strange
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
    const src = JSON.stringify(sortByKeys(translates), null, 2);

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

async function pullLocales(): Promise<ProjectInfoResponse['languages']> {
    const { languages } = await crowdin.projectInfo();

    return languages;
}

function findFile(root: LanguageStatusResponse['files'], path: string): LanguageStatusNode | null {
    const [nodeToSearch, ...rest] = path.split('/');

    for (const node of root) {
        if (node.name !== nodeToSearch) {
            continue;
        }

        if (rest.length === 0) {
            return node;
        }

        return findFile(node.files, rest.join('/'));
    }

    return null;
}

interface IndexFileEntry {
    code: string;
    name: string;
    englishName: string;
    progress: number;
    isReleased: boolean;
}

async function pull() {
    console.log('Pulling locales list...');
    const locales = await pullLocales();
    const checkingProgressBar = progressBar.newBar('| Pulling locales info   :bar :percent | :current/:total', {
        total: locales.length,
        incomplete: '\u2591',
        complete: '\u2588',
        width: locales.length,
    });
    // Add prefix 'c' to current and total to prevent filling thees placeholders with real values
    const downloadingProgressBar = progressBar.newBar('| Downloading translates :bar :percent | :cCurrent/:cTotal', {
        total: 100,
        incomplete: '\u2591',
        complete: '\u2588',
        width: locales.length,
    });
    let downloadingTotal = 0;
    let downloadingReady = 0;

    interface Result {
        locale: ValuesType<typeof locales>;
        progress: number;
        translatesFilePath: string;
    }

    const results = await Promise.all(
        // TODO: there is should be some way to reimplement this
        //       with reduce to avoid null values
        locales.map(
            async (locale): Promise<Result | null> => {
                const { files } = await crowdin.languageStatus(locale.code);
                checkingProgressBar.tick();
                const fileInfo = findFile(files, CROWDIN_FILE_PATH);

                if (fileInfo === null) {
                    throw new Error('Unable to find translation file. Please check the CROWDIN_FILE_PATH param.');
                }

                const progress = (fileInfo.words_approved / fileInfo.words) * 100;

                if (!RELEASED_LOCALES.includes(toInternalLocale(locale.code)) && progress < MIN_RELEASE_PROGRESS) {
                    return null;
                }

                downloadingProgressBar.update(downloadingReady / ++downloadingTotal, {
                    cCurrent: downloadingReady,
                    cTotal: downloadingTotal,
                });

                const translatesFilePath = await crowdin.exportFile(CROWDIN_FILE_PATH, locale.code);

                downloadingProgressBar.update(++downloadingReady / downloadingTotal, {
                    cCurrent: downloadingReady,
                    cTotal: downloadingTotal,
                });

                return {
                    locale,
                    progress,
                    translatesFilePath,
                };
            },
        ),
    );

    console.log('Locales are downloaded. Writing them to file system.');

    const indexFileEntries: { [key: string]: IndexFileEntry } = {
        en: {
            code: 'en',
            name: 'English',
            englishName: 'English',
            progress: 100,
            isReleased: true,
        },
    };
    await Promise.all(
        results
            .filter((result): result is Result => result !== null)
            .map(
                (result) =>
                    new Promise((resolve, reject) => {
                        const {
                            locale: { code, name },
                            progress,
                            translatesFilePath,
                        } = result;
                        const ourCode = toInternalLocale(code);

                        indexFileEntries[ourCode] = {
                            code: ourCode,
                            name: NATIVE_NAMES_MAP[ourCode] || iso639.getNativeName(ourCode),
                            englishName: ENGLISH_NAMES_MAP[ourCode] || name,
                            progress: parseFloat(progress.toFixed(1)),
                            isReleased: RELEASED_LOCALES.includes(ourCode),
                        };

                        fs.copyFile(translatesFilePath, path.join(LANG_DIR, `${ourCode}.json`), 0, (err) => {
                            err ? reject(err) : resolve();
                        });
                    }),
            ),
    );

    console.log('Writing an index file.');

    fs.writeFileSync(path.join(LANG_DIR, INDEX_FILE_NAME), serializeToModule(indexFileEntries));

    console.log(ch.green('The index file was successfully written'));
}

function push() {
    return new Promise((resolve, reject) => {
        prompt.start();
        prompt.get(
            {
                properties: {
                    disapprove: {
                        description: 'Disapprove changed lines? [Y/n]',
                        pattern: /^y|n$/i,
                        message: 'Please enter "y" or "n"',
                        default: 'y',
                        before: (value) => value.toLowerCase() === 'y',
                    },
                },
            },
            async (err, { disapprove }) => {
                if (err) {
                    reject(err);

                    return;
                }

                console.log(`Publishing ${ch.bold(SOURCE_LANG)} translates file...`);

                await crowdin.updateFile(
                    {
                        [CROWDIN_FILE_PATH]: path.join(LANG_DIR, `${SOURCE_LANG}.json`),
                    },
                    {
                        update_option: disapprove ? 'update_as_unapproved' : 'update_without_changes',
                    },
                );

                console.log(ch.green('Success'));

                resolve();
            },
        );
    });
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
