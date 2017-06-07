// @flow
/* eslint no-unused-vars: off */
import type { AuthContext } from 'services/authFlow';

export default class AbstractState {
    resolve(context: AuthContext, payload: Object) {}
    goBack(context: AuthContext) {
        throw new Error('There is no way back');
    }
    reject(context: AuthContext, payload: Object) {}
    enter(context: AuthContext) {}
    leave(context: AuthContext) {}
}
