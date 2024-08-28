import { AuthContext } from 'app/services/authFlow';

export default interface State {
    resolve(context: AuthContext, payload: Record<string, any>): Promise<void> | void;
    goBack(context: AuthContext): void;
    // TODO: remove this method and handle next state resolution via Resolve method
    reject(context: AuthContext, payload?: Record<string, any>): void;
    enter(context: AuthContext): Promise<void> | void;
    leave(context: AuthContext): void;
}
