import React from 'react';
import ReactDOM from 'react-dom';

import { ContextProvider } from 'app/shell';
import { Store } from 'app/types';
import { History } from 'history';

import { bsod } from './actions';
import BSoDContainer from './BSoDContainer';

let injectedStore: Store;
let injectedHistory: History<any>;
let onBsod: undefined | (() => void);

export default function dispatchBsod(store = injectedStore, history = injectedHistory) {
    store.dispatch(bsod());
    onBsod && onBsod();

    ReactDOM.render(
        <ContextProvider store={store} history={history}>
            <BSoDContainer />
        </ContextProvider>,
        document.getElementById('app'),
    );
}

export function inject({
    store,
    history,
    stopLoading,
}: {
    store: Store;
    history: History<any>;
    stopLoading: () => void;
}) {
    injectedStore = store;
    injectedHistory = history;
    onBsod = stopLoading;
}
