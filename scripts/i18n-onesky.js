/* eslint-env node */
/* eslint-disable no-console */

import onesky from 'onesky-utils';
import fs from 'fs';
import ch from 'chalk';

const LANG_DIR = `${__dirname}/../src/i18n`;
const SOURCE_LANG = 'en'; // Базовый язык, относительно которого будут формироваться все остальные переводы
const SOURCE_FILE_NAME = 'i18n.json'; // Название файла с исходными строками внутри OneSky
const INDEX_FILE_NAME = 'index.json'; // Название файла с информацией о переводах
const MIN_RELEASE_PROGRESS = 80; // Какой процент локали перевода должен быть выполнен, чтобы локаль была опубликована

/**
 * Массив локалей для соответствия каноничному виду в OneSky и нашему представлению
 * о том, каким должны быть имена локалей
 */
const LOCALES_MAP = {
    ru: 'ru-RU',
    en: 'en-GB',
    sl: 'sl-SI',
    fr: 'fr-FR',
    el: 'el-GR',
    de: 'de-DE',
    sr: 'sr-RS',
    lt: 'lt-LT',
};

/**
 * Некоторые языки, после выгрузки из OneSky, имеют не очень информативные названия,
 * так что здесь можно указать точные имена для результирующего файла index.json
 */
const ORIGINAL_NAMES_MAP = {
    en: 'English, UK',
    pt: 'Português do Brasil',
};

/**
 * Некоторые языки, после выгрузки из OneSky, имеют не очень точные английские названия,
 * так что здесь можно указать точные имена для результирующего файла index.json
 */
const ENGLISH_NAMES_MAP = {
    en: 'English, UK',
    pt: 'Portuguese, Brazilian',
};

// https://ely-translates.oneskyapp.com/admin/site/settings
const defaultOptions = {
    apiKey: '5MaW9TYp0S3qdJgkZ5QLgEIDeabkFDzB',
    secret: 'qd075hUNpop4DItD6KOXKQnbqWPLZilf',
    projectId: 201323,
};

/**
 * Переводит из кода языка в OneSky в наше представление
 *
 * @param {string} code
 * @return {string}
 */
function code2locale(code) {
    for (const locale in LOCALES_MAP) {
        if (code === LOCALES_MAP[locale]) {
            return locale;
        }
    }

    return code;
}

/**
 * Переводит из нашего формата локалей в ожидаемое значение OneSky
 *
 * @param {string} locale
 * @return {string}
 */
function locale2code(locale) {
    return LOCALES_MAP[locale] || locale;
}

/**
 * Форматирует входящий объект с переводами в итоговую строку в том формате, в каком они
 * хранятся в самом приложении
 *
 * @param {object} translates
 * @return {string}
 */
function formatTranslates(translates) {
    return JSON.stringify(sortByKeys(translates), null, 4) + '\n'; // eslint-disable-line prefer-template
}

/**
 * http://stackoverflow.com/a/29622653/5184751
 *
 * @param {object} object
 * @return {object}
 */
function sortByKeys(object) {
    return Object.keys(object).sort().reduce((result, key) => {
        result[key] = object[key];
        return result;
    }, {});
}

/**
 * Убирает значение в скобках.
 * Например: "French (France)" => "French".
 *
 * @param {string} value
 * @return {string}
 */
function trimValueInBrackets(value) {
    return value.match(/^([^\(]+)/)[0].trim();
}

async function pullReadyLanguages() {
    const languages = JSON.parse(await onesky.getLanguages({...defaultOptions}));
    return languages.data
        .filter((elem) => elem.is_ready_to_publish || parseFloat(elem.translation_progress) > MIN_RELEASE_PROGRESS);
}

async function pullTranslate(language) {
    const rawResponse = await onesky.getFile({...defaultOptions, language, fileName: SOURCE_FILE_NAME});
    const response = JSON.parse(rawResponse);
    fs.writeFileSync(`${LANG_DIR}/${code2locale(language)}.json`, formatTranslates(response));
}

async function pull() {
    console.log('Pulling locales list...');
    const langs = await pullReadyLanguages();
    const langsList = langs.map((elem) => elem.custom_locale || elem.code);

    console.log(ch.green('Pulled locales: ') + langsList.map((lang) => code2locale(lang)).join(', '));

    console.log('Pulling translates...');
    await Promise.all(langsList.map(async (lang) => {
        await pullTranslate(lang);
        console.log(ch.green('Locale ') + ch.white.bold(code2locale(lang)) + ch.green(' successfully pulled'));
    }));

    console.log('Writing an index file...');
    const mapFileContent = {};
    langs.map((elem) => {
        mapFileContent[elem.locale] = {
            name: ORIGINAL_NAMES_MAP[elem.locale] || trimValueInBrackets(elem.local_name),
            englishName: ENGLISH_NAMES_MAP[elem.locale] || trimValueInBrackets(elem.english_name),
            progress: parseFloat(elem.translation_progress),
            isReleased: elem.is_ready_to_publish,
        };
    });
    fs.writeFileSync(`${LANG_DIR}/${INDEX_FILE_NAME}`, formatTranslates(mapFileContent));
    console.log(ch.green('The index file was successfully written'));
}

async function publish() {
    console.log(`Publishing ${ch.bold(SOURCE_LANG)} translates file...`);
    await onesky.postFile({
        ...defaultOptions,
        format: 'HIERARCHICAL_JSON',
        content: fs.readFileSync(`${LANG_DIR}/${SOURCE_LANG}.json`, 'utf8'),
        keepStrings: false,
        language: locale2code(SOURCE_LANG),
        fileName: SOURCE_FILE_NAME,
    });
    console.log(ch.green('Success'));
}

try {
    const action = process.argv[2];
    switch (action) {
        case 'pull':
            pull();
            break;
        case 'publish':
            publish();
            break;
        default:
            throw new Error(`Unknown action ${action}`);
    }
} catch (exception) {
    console.error(exception);
}
