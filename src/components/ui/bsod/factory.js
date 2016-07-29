import request from 'services/request';

import dispatchBsod, { inject } from './dispatchBsod';

export default function factory(store, stopLoading) {
    inject(store, stopLoading);

    // do bsod for 500 errors
    request.addMiddleware({
        catch(resp) {
            if (resp && resp.originalResponse.status === 500) {
                dispatchBsod();
            }

            return Promise.reject(resp);
        }
    });
}
