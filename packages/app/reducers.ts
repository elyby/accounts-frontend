import { combineReducers } from 'redux';

import auth, { State as AuthState } from 'app/components/auth/reducer';
import user, { State as UserState } from 'app/components/user/reducer';
import accounts, { State as AccountsState } from 'app/components/accounts/reducer';
import i18n, { State as I18nState } from 'app/components/i18n/reducer';
import popup, { State as PopupState } from 'app/components/ui/popup/reducer';
import bsod, { State as BsodState } from 'app/components/ui/bsod/reducer';
import apps, { Apps } from 'app/components/dev/apps/reducer';
import { ThunkDispatch, ThunkAction as ReduxThunkAction } from 'redux-thunk';
import { Store as ReduxStore } from 'redux';

export interface RootState {
    auth: AuthState;
    bsod: BsodState;
    accounts: AccountsState;
    user: UserState;
    popup: PopupState;
    apps: Apps;
    i18n: I18nState;
}

export interface Action<T = any> {
    type: string;
    payload?: T;
}
export type Dispatch<T extends Action = Action> = ThunkDispatch<RootState, undefined, T>;
export type GetState = () => RootState;
export type ThunkAction<T = any> = ReduxThunkAction<T, RootState, undefined, Action>;
export type Store = ReduxStore<RootState> & {
    dispatch: Dispatch;
};

export default combineReducers<RootState>({
    bsod,
    auth,
    user,
    accounts,
    i18n,
    popup,
    apps,
});
