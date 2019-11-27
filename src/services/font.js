import webFont from 'webfontloader';
import logger from 'services/logger';

export default {
  /**
   * @param {Array} families
   * @param {object} options
   * @param {bool} [options.external=false] - whether the font should be loaded from external source (e.g. google)
   *
   * @returns {Promise}
   */
  load(families = [], options = {}) {
    let config = {
      custom: { families },
    };

    if (options.external) {
      config = {
        google: { families },
      };
    }

    return new Promise(resolve =>
      webFont.load({
        classes: false,
        active: resolve,
        inactive() {
          logger.warn('Failed loading the font', {
            families,
          });
          resolve();
        },
        timeout: 2000,
        ...config,
      }),
    );
  },
};
