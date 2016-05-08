module.exports = function() {
    this.cacheable && this.cacheable();

    var moduleId = this.context
        .replace(this.options.resolve.root, '')
        .replace(/^\/|\/$/g, '')
        .replace(/\//g, '.');

    var content = this.inputValue[0];
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
