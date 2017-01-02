import request from 'services/request';
import logger from 'services/logger';

import dispatchBsod, { inject } from './dispatchBsod';

export default function factory(store, stopLoading) {
    inject(store, stopLoading);

    // do bsod for 500/404 errors
    request.addMiddleware({
        catch(resp) {
            if (resp
                && resp.originalResponse
                && [5, 404].indexOf(resp.originalResponse.status) === 0
            ) {
                dispatchBsod();

                logger.warn('Unexpected response', {resp});
            }

            return Promise.reject(resp);
        }
    });
}
