import { SET_LOCALE } from './actions';

export default function(state = {}, {type, payload}) {
    if (type === SET_LOCALE) {
        return payload;
    }

    return state;
}
