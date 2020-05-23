/**
 * A helper wrapper service around window.history
 */

import { createBrowserHistory, History } from 'history';

export const browserHistory = createBrowserHistory();

browserHistory.listen(() => {
    patchHistory(browserHistory);
});

function patchHistory(history: History): void {
    Object.assign(history.location, {
        query: new URLSearchParams(history.location.search),
    });
}

patchHistory(browserHistory);

export default {
    initialLength: 0,

    init() {
        this.initialLength = window.history.length;
    },

    /**
     * @returns {boolean} - whether history.back() can be safetly called
     */
    canGoBack() {
        return (
            document.referrer.includes(`${location.protocol}//${location.host}`) ||
            this.initialLength < window.history.length
        );
    },
};
