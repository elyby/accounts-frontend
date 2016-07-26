export const POPUP_CREATE = 'POPUP_CREATE';

/**
 * @param {object|ReactComponent} payload - react component or options
 * @param {ReactComponent} payload.Popup
 * @param {bool} [payload.disableOverlayClose=false] - do not allow hiding popup
 *
 * @return {object}
 */
export function create(payload) {
    if (typeof payload === 'function') {
        payload = {
            Popup: payload
        };
    }

    return {
        type: POPUP_CREATE,
        payload
    };
}

export const POPUP_DESTROY = 'POPUP_DESTROY';
export function destroy(popup) {
    return {
        type: POPUP_DESTROY,
        payload: popup
    };
}
