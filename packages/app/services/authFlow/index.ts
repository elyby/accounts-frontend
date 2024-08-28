import AuthFlow, { availableActions, AuthContext as TAuthContext } from './AuthFlow';

export type AuthContext = TAuthContext;
export default new AuthFlow(availableActions);
