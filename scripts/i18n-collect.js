import fs from 'fs';
import {sync as globSync} from 'glob';
import {sync as mkdirpSync} from 'mkdirp';
import chalk from 'chalk';
import prompt from 'prompt';

const MESSAGES_PATTERN = `../dist/messages/**/*.json`;
const LANG_DIR = `../src/i18n`;
const DEFAULT_LOCALE = 'en';
const SUPPORTED_LANGS = [DEFAULT_LOCALE].concat('ru');

/**
 * Aggregates the default messages that were extracted from the app's
 * React components via the React Intl Babel plugin. An error will be thrown if
 * there are messages in different components that use the same `id`. The result
 * is a flat collection of `id: message` pairs for the app's default locale.
 */
let idToFileMap = {};
let duplicateIds = [];
let defaultMessages = globSync(MESSAGES_PATTERN)
    .map((filename) => [filename, JSON.parse(fs.readFileSync(filename, 'utf8'))])
    .reduce((collection, [file, descriptors]) => {
        descriptors.forEach(({id, defaultMessage}) => {
            if (collection.hasOwnProperty(id)) {
                duplicateIds.push(id);
            }

            collection[id] = defaultMessage;
            idToFileMap[id] = (idToFileMap[id] || []).concat(file);
        });

        return collection;
    }, {});

if (duplicateIds.length) {
    console.log('\nFound duplicated ids:');
    duplicateIds.forEach((id) => console.log(`${chalk.yellow(id)}:\n - ${idToFileMap[id].join('\n - ')}\n`));
    console.log(chalk.red('Please correct the errors above to proceed further!'));
    return;
}

duplicateIds = null;
idToFileMap = null;

/**
 * Making a diff with the previous DEFAULT_LOCALE version
 */
const defaultMessagesPath = `${LANG_DIR}/${DEFAULT_LOCALE}.json`;
let keysToUpdate = [];
let keysToAdd = [];
let keysToRemove = [];
const isNotMarked = (value) => value.slice(0, 2) !== '--';
try {
    const prevMessages = JSON.parse(fs.readFileSync(defaultMessagesPath, 'utf8'));
    keysToAdd = Object.keys(defaultMessages).filter((key) => !prevMessages[key]);
    keysToRemove = Object.keys(prevMessages).filter((key) => !defaultMessages[key]).filter(isNotMarked);
    keysToUpdate = Object.entries(prevMessages).reduce((acc, [key, message]) =>
        acc.concat(defaultMessages[key] && defaultMessages[key] !== message ? key : [])
    , []);
} catch(err) {
    console.log(chalk.yellow(`Can not read ${defaultMessagesPath}. The new file will be created.`), err);
}

if (!keysToAdd.length && !keysToRemove.length && !keysToUpdate.length) {
    return console.log(chalk.green('Everything is up to date!'));
}

console.log(chalk.magenta(`The diff relative to default locale (${DEFAULT_LOCALE}) is:`));

if (keysToRemove.length) {
    console.log('The following keys will be removed:');
    console.log(chalk.red('\n - ') + keysToRemove.join(chalk.red('\n - ')) + '\n');
}

if (keysToAdd.length) {
    console.log('The following keys will be added:');
    console.log(chalk.green('\n + ') + keysToAdd.join(chalk.green('\n + ')) + '\n');
}

if (keysToUpdate.length) {
    console.log('The following keys will be updated:');
    console.log(chalk.yellow('\n @ ') + keysToUpdate.join(chalk.yellow('\n @ ')) + '\n');
}

prompt.start();
prompt.get({
    properties: {
        apply: {
            description: 'Apply changes? [Y/n]',
            pattern: /^y|n$/i,
            message: 'Please enter "y" or "n"',
            default: 'y',
            before: (value) => value.toLowerCase() === 'y'
        }
    }
}, (err, resp) => {
    console.log('\n');

    if (err || !resp.apply) {
        return console.log(chalk.red('Aborted'));
    }

    buildLocales();

    console.log(chalk.green('All locales was successfuly built'));
});


function buildLocales() {
    mkdirpSync(LANG_DIR);

    SUPPORTED_LANGS.map((lang) => {
        const destPath = `${LANG_DIR}/${lang}.json`;

        let newMessages = {};
        try {
            newMessages = JSON.parse(fs.readFileSync(destPath, 'utf8'));
        } catch (err) {
            console.log(chalk.yellow(`Can not read ${destPath}. The new file will be created.`), err);
        }

        keysToRemove.forEach((key) => {
            delete newMessages[key];
        });
        keysToUpdate.forEach((key) => {
            newMessages[`--${key}`] = newMessages[key];
        });
        keysToAdd.concat(keysToUpdate).forEach((key) => {
            newMessages[key] = defaultMessages[key];
        });

        const sortedKeys = Object.keys(newMessages).sort((a, b) => {
            a = a.replace(/^\-+/, '');
            b = b.replace(/^\-+/, '');

            return a < b || !isNotMarked(a) ? -1 : 1;
        });

        const sortedNewMessages = sortedKeys.reduce((acc, key) => {
            acc[key] = newMessages[key];

            return acc;
        }, {});

        fs.writeFileSync(destPath, JSON.stringify(sortedNewMessages, null, 4) + '\n');
    });
}
