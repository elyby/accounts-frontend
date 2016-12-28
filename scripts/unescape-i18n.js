/* eslint-env node */
/* eslint-disable no-console */
import fs from 'fs';
import {sync as globSync} from 'glob';

const LANG_DIR = `${__dirname}/../src/i18n`;

/**
 * При выгрузке из OneSky мы получаем json, в котором все не-латинские символы за-escape-ны.
 * Это увеличивает вес переводов и портит дифы. Поэтому мы просто прокручиваем их json
 * и на выходе получаем чистые файлы, без escape-последовательностей.
 */
globSync(`${LANG_DIR}/*.json`).forEach((filename) => {
    const json = JSON.parse(fs.readFileSync(filename, 'utf8'));
    fs.writeFileSync(filename, JSON.stringify(json, null, 4) + "\n");
});
