/* eslint-disable @typescript-eslint/no-unused-vars */
import { AuthContext } from 'app/services/authFlow';

export default class AbstractState {
  resolve(
    context: AuthContext,
    payload: Record<string, any>,
  ): Promise<void> | void {}
  goBack(context: AuthContext): void {
    throw new Error('There is no way back');
  }
  reject(context: AuthContext, payload?: Record<string, any>): void {}
  enter(context: AuthContext): Promise<void> | void {}
  leave(context: AuthContext): void {}
}
