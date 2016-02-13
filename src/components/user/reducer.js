import { UPDATE, SET } from './actions';

import User from './User';

export default function user(
    state = new User(),
    {type, payload = null}
) {
    switch (type) {
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
