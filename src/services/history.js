/**
 * A helper wrapper service around window.history
 */

import createBrowserHistory from 'history/createBrowserHistory';

export const browserHistory = createBrowserHistory();

browserHistory.listen(() => {
    patchHistory(browserHistory);
});

function patchHistory(history) {
    Object.assign(history.location,
        {query: new URLSearchParams(history.location.search)}
    );
}

patchHistory(browserHistory);

export default {
    init() {
        this.initialLength = window.history.length;
    },

    /**
     * @return {bool} - whether history.back() can be safetly called
     */
    canGoBack() {
        return document.referrer.includes(`${location.protocol}//${location.host}`)
            || this.initialLength < window.history.length;
    }
};
