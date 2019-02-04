// @flow
import { UPDATE, SET, CHANGE_LANG } from './actions';

export type User = {|
    id: ?number,
    uuid: ?string,
    token: string,
    username: string,
    email: string,
    avatar: string,
    lang: string,
    isGuest: bool,
    isActive: bool,
    isOtpEnabled: bool,
    passwordChangedAt: number,
    hasMojangUsernameCollision: bool,
    maskedEmail?: string,
    shouldAcceptRules?: bool,
|};

export type State = {
    user: User, // TODO: replace with centralized global state
};

const defaults: User = {
    id: null,
    uuid: null,
    username: '',
    token: '',
    email: '',
    // will contain user's email or masked email
    // (e.g. ex**ple@em*il.c**) depending on what information user have already provided
    maskedEmail: '',
    avatar: '',
    lang: '',
    isActive: false,
    isOtpEnabled: false,
    shouldAcceptRules: false, // whether user need to review updated rules
    passwordChangedAt: 0,
    hasMojangUsernameCollision: false,

    // frontend specific attributes
    isGuest: true
};

export default function user(
    state: User = defaults,
    {type, payload}: {type: string, payload: ?Object}
) {
    switch (type) {
        case CHANGE_LANG:
            if (!payload || !payload.lang) {
                throw new Error('payload.lang is required for user reducer');
            }

            return {
                ...state,
                lang: payload.lang
            };

        case UPDATE:
            if (!payload) {
                throw new Error('payload is required for user reducer');
            }

            return {
                ...state,
                ...payload
            };

        case SET:
            payload = payload || {};

            return {
                ...defaults,
                ...payload
            };

        default:
            return state || {
                ...defaults
            };
    }
}
