import webFont from 'webfontloader';

export default {
    /**
     * @param {array} families
     * @param {object} options
     * @param {bool} [options.external=false] - whether the font should be loaded from external source (e.g. google)
     *
     * @return {Promise}
     */
    load(families = [], options = {}) {
        let config = {
            custom: {families}
        };

        if (options.external) {
            config = {
                google: {families}
            };
        }

        return new Promise((resolve) =>
            webFont.load({
                classes: false,
                active: resolve,
                inactive: resolve, // TODO: may be we should track such cases
                timeout: 2000,
                ...config
            })
        );
    }
};
