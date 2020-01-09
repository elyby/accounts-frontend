/* eslint-disable @typescript-eslint/no-unused-vars */
import { AuthContext } from 'app/services/authFlow';

export default class AbstractState {
  resolve(context: AuthContext, payload: { [key: string]: any }): any {}
  goBack(context: AuthContext): any {
    throw new Error('There is no way back');
  }
  reject(context: AuthContext, payload: { [key: string]: any }): any {}
  enter(context: AuthContext): any {}
  leave(context: AuthContext): any {}
}
