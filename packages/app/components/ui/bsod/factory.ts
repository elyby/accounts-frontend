import { History } from 'history';

import { addErrorListener } from 'app/services/request';
import logger from 'app/services/logger';
import { Store } from 'app/types';

import dispatchBsod, { inject } from './dispatchBsod';
import createBsodErrorListener from './bsodErrorListener';

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
    addErrorListener(createBsodErrorListener(dispatchBsod, logger));
}
