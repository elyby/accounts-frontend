export const POPUP_REGISTER = 'POPUP_REGISTER';
export function register(type, component) {
    return {
        type: POPUP_REGISTER,
        payload: {
            type,
            component
        }
    };
}

export const POPUP_CREATE = 'POPUP_CREATE';
export function create(type, props = {}) {
    return {
        type: POPUP_CREATE,
        payload: {
            type,
            props
        }
    };
}

export const POPUP_DESTROY = 'POPUP_DESTROY';
export function destroy(popup) {
    return {
        type: POPUP_DESTROY,
        payload: popup
    };
}
