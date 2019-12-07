import { combineReducers } from 'redux';

import auth, { State as AuthState } from 'components/auth/reducer';
import user, { User } from 'components/user/reducer';
import accounts, { State as AccountsState } from 'components/accounts/reducer';
import i18n, { State as I18nState } from 'components/i18n/reducer';
import popup, { State as PopupState } from 'components/ui/popup/reducer';
import bsod from 'components/ui/bsod/reducer';
import apps, { Apps } from 'components/dev/apps/reducer';
import { ThunkDispatch, ThunkAction as ReduxThunkAction } from 'redux-thunk';
import { Store as ReduxStore } from 'redux';

export interface RootState {
  auth: AuthState;
  accounts: AccountsState;
  user: User;
  popup: PopupState;
  apps: Apps;
  i18n: I18nState;
}

export interface Action<T = any> {
  type: string;
  payload?: T;
}
export type Dispatch<T extends Action = Action> = ThunkDispatch<
  RootState,
  undefined,
  T
>;
export type GetState = () => RootState;
export type ThunkAction<T = any> = ReduxThunkAction<
  T,
  RootState,
  undefined,
  Action
>;
export type Store = ReduxStore<RootState> & {
  dispatch: Dispatch;
};

export default combineReducers({
  bsod,
  auth,
  user,
  accounts,
  i18n,
  popup,
  apps,
});
