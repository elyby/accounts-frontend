/**
 * A helper wrapper service around window.history
 */

import { createBrowserHistory } from 'history';

export const browserHistory = createBrowserHistory();

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
