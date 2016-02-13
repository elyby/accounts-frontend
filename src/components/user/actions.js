export const UPDATE = 'USER_UPDATE';
/**
 * @param  {string|Object} payload jwt token or user object
 * @return {Object} action definition
 */
export function updateUser(payload) {
    return {
        type: UPDATE,
        payload
    };
}

export const SET = 'USER_SET';
export function setUser(payload) {
    return {
        type: SET,
        payload
    };
}

export function logout() {
    return setUser({isGuest: true});
}
