// @flow
/* eslint-env node */
/* eslint-disable no-console */

import fs from 'fs';
import path from 'path';
import CrowdinApi from 'crowdin-api';
import MultiProgress from 'multi-progress';
import ch from 'chalk';
import iso639 from 'iso-639-1';
import prompt from 'prompt';

import config from '../config';

if (!config.crowdinApiKey) {
  console.error(ch.red`crowdinApiKey is required`);
  process.exit(126);
}

const PROJECT_ID = 'elyby';
const PROJECT_KEY = config.crowdinApiKey;
const CROWDIN_FILE_PATH = 'accounts/site.json';
const SOURCE_LANG = 'en';
const LANG_DIR = path.resolve(`${__dirname}/../src/i18n`);
const INDEX_FILE_NAME = 'index.json';
const MIN_RELEASE_PROGRESS = 80; // Minimal ready percent before translation can be published

const crowdin = new CrowdinApi({ apiKey: PROJECT_KEY });
const progressBar = new MultiProgress();

/**
 * Locales that has been verified by core team members
 */
const RELEASED_LOCALES = ['be', 'fr', 'id', 'pt', 'ru', 'uk', 'vi', 'zh'];

/**
 * Array of Crowdin locales to our internal locales representation
 */
const LOCALES_MAP = {
  'pt-BR': 'pt',
  'zh-CN': 'zh',
};

/**
 * This array allows us to customise native languages names, because ISO-639-1 sometimes is strange
 */
const NATIVE_NAMES_MAP = {
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
const ENGLISH_NAMES_MAP = {
  pt: 'Portuguese, Brazilian',
  sr: 'Serbian',
  zh: 'Simplified Chinese',
};

/**
 * Converts Crowdin's language code to our internal value
 *
 * @param {string} code
 * @returns {string}
 */
function toInternalLocale(code: string): string {
  return LOCALES_MAP[code] || code;
}

/**
 * Форматирует входящий объект с переводами в итоговую строку в том формате, в каком они
 * хранятся в самом приложении
 *
 * @param {object} translates
 * @returns {string}
 */
function serializeToFormattedJson(translates: Object): string {
  return JSON.stringify(sortByKeys(translates), null, 4) + '\n'; // eslint-disable-line prefer-template
}

/**
 * http://stackoverflow.com/a/29622653/5184751
 *
 * @param {object} object
 * @returns {object}
 */
function sortByKeys(object: Object): Object {
  return Object.keys(object)
    .sort()
    .reduce((result, key) => {
      result[key] = object[key];

      return result;
    }, {});
}

interface ProjectInfoFile {
  node_type: 'file';
  id: number;
  name: string;
  created: string;
  last_updated: string;
  last_accessed: string;
  last_revision: string;
}

interface ProjectInfoDirectory {
  node_type: 'directory';
  id: number;
  name: string;
  files: Array<ProjectInfoFile | ProjectInfoDirectory>;
}

interface ProjectInfoResponse {
  details: {
    source_language: {
      name: string,
      code: string,
    },
    name: string,
    identifier: string,
    created: string,
    description: string,
    join_policy: string,
    last_build: string | null,
    last_activity: string,
    participants_count: string, // it's number, but string in the response
    logo_url: string | null,
    total_strings_count: string, // it's number, but string in the response
    total_words_count: string, // it's number, but string in the response
    duplicate_strings_count: number,
    duplicate_words_count: number,
    invite_url: {
      translator: string,
      proofreader: string,
    },
  };
  languages: Array<{
    name: string, // English language name
    code: string,
    can_translate: 0 | 1,
    can_approve: 0 | 1,
  }>;
  files: Array<ProjectInfoFile | ProjectInfoDirectory>;
}

async function pullLocales() {
  const { languages }: ProjectInfoResponse = await crowdin.projectInfo(
    PROJECT_ID,
  );

  return languages;
}

interface LanguageStatusNode {
  node_type: 'directory' | 'file';
  id: number;
  name: string;
  phrases: number;
  translated: number;
  approved: number;
  words: number;
  words_translated: number;
  words_approved: number;
  files: Array<LanguageStatusNode>;
}

function findFile(
  root: Array<LanguageStatusNode>,
  path: string,
): LanguageStatusNode | null {
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
  const checkingProgressBar = progressBar.newBar(
    '| Pulling locales info   :bar :percent | :current/:total',
    {
      total: locales.length,
      incomplete: '\u2591',
      complete: '\u2588',
      width: locales.length,
    },
  );
  // Add prefix 'c' to current and total to prevent filling thees placeholders with real values
  const downloadingProgressBar = progressBar.newBar(
    '| Downloading translates :bar :percent | :cCurrent/:cTotal',
    {
      total: 100,
      incomplete: '\u2591',
      complete: '\u2588',
      width: locales.length,
    },
  );
  let downloadingTotal = 0;
  let downloadingReady = 0;
  const results = await Promise.all(
    locales.map(async locale => {
      const {
        files,
      }: { files: Array<LanguageStatusNode> } = await crowdin.languageStatus(
        PROJECT_ID,
        locale.code,
      );
      checkingProgressBar.tick();
      const fileInfo = findFile(files, CROWDIN_FILE_PATH);

      if (fileInfo === null) {
        throw new Error(
          'Unable to find translation file. Please check the CROWDIN_FILE_PATH param.',
        );
      }

      const progress = (fileInfo.words_approved / fileInfo.words) * 100;

      if (
        !RELEASED_LOCALES.includes(toInternalLocale(locale.code)) &&
        progress < MIN_RELEASE_PROGRESS
      ) {
        return null;
      }

      downloadingProgressBar.update(downloadingReady / ++downloadingTotal, {
        cCurrent: downloadingReady,
        cTotal: downloadingTotal,
      });

      const translatesFilePath = await crowdin.exportFile(
        PROJECT_ID,
        CROWDIN_FILE_PATH,
        locale.code,
      );

      downloadingProgressBar.update(++downloadingReady / downloadingTotal, {
        cCurrent: downloadingReady,
        cTotal: downloadingTotal,
      });

      return {
        locale,
        progress,
        translatesFilePath,
      };
    }),
  );

  console.log('Locales are downloaded. Writing them to file system.');

  const indexFileEntries: { [string]: IndexFileEntry } = {
    en: {
      code: 'en',
      name: 'English',
      englishName: 'English',
      progress: 100,
      isReleased: true,
    },
  };
  // $FlowFixMe
  await Promise.all(
    results.map(
      result =>
        new Promise((resolve, reject) => {
          if (result === null) {
            resolve();

            return;
          }

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

          fs.copyFile(
            translatesFilePath,
            path.join(LANG_DIR, `${ourCode}.json`),
            0,
            err => {
              err ? reject(err) : resolve();
            },
          );
        }),
    ),
  );

  console.log('Writing an index file.');

  fs.writeFileSync(
    path.join(LANG_DIR, INDEX_FILE_NAME),
    serializeToFormattedJson(indexFileEntries),
  );

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
            before: value => value.toLowerCase() === 'y',
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
          PROJECT_ID,
          {
            [CROWDIN_FILE_PATH]: path.join(LANG_DIR, `${SOURCE_LANG}.json`),
          },
          {
            // eslint-disable-next-line camelcase
            update_option: disapprove
              ? 'update_as_unapproved'
              : 'update_without_changes',
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
