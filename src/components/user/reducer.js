import { UPDATE, SET, CHANGE_LANG } from './actions';

import User from './User';

// TODO: возможно есть смысл инитить обьект User снаружи, так как редусер не должен столько знать
export default function user(
    state = new User(),
    {type, payload = null}
) {
    switch (type) {
        case CHANGE_LANG:
            if (!payload || !payload.lang) {
                throw new Error('payload.lang is required for user reducer');
            }

            return new User({
                ...state,
                lang: payload.lang
            });

        case UPDATE:
            if (!payload) {
                throw new Error('payload is required for user reducer');
            }

            return new User({
                ...state,
                ...payload
            });

        case SET:
            return new User(payload || {});

        default:
            return state;
    }
}
