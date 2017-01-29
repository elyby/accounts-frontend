/**
 * A helper wrapper service around window.history
 */

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
}
