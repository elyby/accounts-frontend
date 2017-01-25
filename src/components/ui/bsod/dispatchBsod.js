import React from 'react';
import ReactDOM from 'react-dom';

import { bsod } from './actions';
import BSoD from 'components/ui/bsod/BSoD';
import font from 'services/font';

let injectedStore;
let onBsod;

export default function dispatchBsod(store = injectedStore) {
    store.dispatch(bsod());
    onBsod && onBsod();

    font.load(['Consolas']).then(() =>
        ReactDOM.render(
            <BSoD store={store} />,
            document.getElementById('app')
        )
    );
}

export function inject(store, stopLoading) {
    injectedStore = store;
    onBsod = stopLoading;
}
