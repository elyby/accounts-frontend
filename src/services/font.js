import webFont from 'webfontloader';

export default {
    /**
     * @param {array} families
     *
     * @return {Promise}
     */
    load(families = []) {
        return new Promise((resolve) =>
            webFont.load({
                classes: false,
                active: resolve,
                inactive: resolve, // TODO: may be we should track such cases
                timeout: 2000,
                custom: {
                    families
                }
            })
        );
    }
};
