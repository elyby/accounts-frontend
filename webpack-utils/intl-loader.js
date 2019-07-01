module.exports = function(content) {
    this.cacheable && this.cacheable();
    content = JSON.parse(content);

    const moduleId = this.context
        .replace(this.rootContext, '')
        // TODO: can't find the way to strip out this path part programmatically
        // this is a directory from resolve.modules config
        // may be this may work: .replace(this._compiler.options.resolve.root, '')
        .replace('src/', '')
        .replace(/^\/|\/$/g, '')
        .replace(/\//g, '.');

    content = JSON.stringify(
        Object.keys(content).reduce(
            (translations, key) => ({
                ...translations,
                [key]: {
                    id: `${moduleId}.${key}`,
                    defaultMessage: content[key]
                }
            }),
            {}
        )
    );

    return `import { defineMessages } from 'react-intl';

export default defineMessages(${content})`;
};
