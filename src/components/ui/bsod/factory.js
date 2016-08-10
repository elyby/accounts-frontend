import request from 'services/request';

import dispatchBsod, { inject } from './dispatchBsod';

export default function factory(store, stopLoading) {
    inject(store, stopLoading);

    // do bsod for 500/404 errors
    request.addMiddleware({
        catch(resp) {
            if (resp && resp.originalResponse && [500, 404].indexOf(resp.originalResponse.status) > -1) {
                dispatchBsod();
            }

            return Promise.reject(resp);
        }
    });
}
