import { Action } from './actions';

export interface User {
    id: number | null;
    uuid: string | null;
    token: string;
    username: string;
    email: string;
    avatar: string;
    lang: string;
    isGuest: boolean;
    isActive: boolean;
    isDeleted: boolean;
    isOtpEnabled: boolean;
    passwordChangedAt: number;
    hasMojangUsernameCollision: boolean;
    maskedEmail?: string;
    shouldAcceptRules?: boolean;
}

export type State = User;

const defaults: State = {
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
    isDeleted: false,
    isOtpEnabled: false,
    shouldAcceptRules: false, // whether user need to review updated rules
    passwordChangedAt: 0,
    hasMojangUsernameCollision: false,

    // frontend specific attributes
    isGuest: true,
};

export default function user(state: State = defaults, action: Action): State {
    switch (action.type) {
        case 'user:changeLang':
            return {
                ...state,
                lang: action.payload,
            };
        case 'user:update':
            return {
                ...state,
                ...action.payload,
            };
        case 'user:set':
            return {
                ...defaults,
                ...action.payload,
            };
        default:
            return (
                state || {
                    ...defaults,
                }
            );
    }
}
