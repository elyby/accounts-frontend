import request from 'app/services/request';
import logger from 'app/services/logger';
import { Store } from 'app/reducers';
import { History } from 'history';

import dispatchBsod, { inject } from './dispatchBsod';
import BsodMiddleware from './BsodMiddleware';

export default function factory({
    store,
    history,
    stopLoading,
}: {
    store: Store;
    history: History<any>;
    stopLoading: () => void;
}) {
    inject({ store, history, stopLoading });

    // do bsod for 500/404 errors
    request.addMiddleware(new BsodMiddleware(dispatchBsod, logger));
}
