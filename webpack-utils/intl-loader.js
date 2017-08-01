module.exports = function(content) {
    this.cacheable && this.cacheable();
    content = JSON.parse(content);

    const moduleId = this.context
        .replace(this.options.resolve.root, '')
        .replace(/^\/|\/$/g, '')
        .replace(/\//g, '.');

    content = JSON.stringify(Object.keys(content).reduce(function(translations, key) {
        translations[key] = {
            id: moduleId + '.' + key,
            defaultMessage: content[key]
        };

        return translations;
    }, {}));

    return 'import { defineMessages } from \'react-intl\';'
        + 'export default defineMessages(' + content + ')';
};
