import { BSOD } from './actions';

export default function(state = false, {type}) {
    if (type === BSOD) {
        return true;
    }

    return state;
}
