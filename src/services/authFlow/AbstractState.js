// @flow
/* eslint no-unused-vars: off */
import type { AuthContext } from 'services/authFlow';

export default class AbstractState {
    resolve(context: AuthContext, payload: Object): void {}
    goBack(context: AuthContext): void {
        throw new Error('There is no way back');
    }
    reject(context: AuthContext, payload: Object): void {}
    enter(context: AuthContext): void {}
    leave(context: AuthContext): void {}
}
