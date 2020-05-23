// @ts-nocheck
function transform(src, modulePath, rootContext) {
    const json = JSON.parse(src);

    const moduleId = modulePath
        .replace(rootContext, '')
        // TODO: can't find the way to strip out this path part programmatically
        // this is a directory from resolve.modules config
        // may be this may work: .replace(this._compiler.options.resolve.root, '')
        .replace('packages/app/', '')
        .replace(/^\/|\/$/g, '')
        .replace(/\//g, '.');

    return JSON.stringify(
        Object.keys(json).reduce(
            (translations, key) => ({
                ...translations,
                [key]: {
                    id: `${moduleId}.${key}`,
                    defaultMessage: json[key],
                },
            }),
            {},
        ),
    );
}

module.exports = function (content) {
    this.cacheable && this.cacheable();

    content = transform(content, this.context, this.rootContext);

    return `import { defineMessages } from 'react-intl';

export default defineMessages(${content})`;
};

module.exports.transform = transform;
