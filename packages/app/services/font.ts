import webFont from 'webfontloader';
import logger from 'app/services/logger';

export default {
  /**
   * @param {Array} families
   * @param {object} options
   * @param {boolean} [options.external=false] - whether the font should be loaded from external source (e.g. google)
   *
   * @returns {Promise}
   */
  load(
    families: string[] = [],
    options: {
      external?: boolean;
    } = {},
  ): Promise<void> {
    let config: { [key: string]: any } = {
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
