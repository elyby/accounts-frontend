import { Store as ReduxStore } from 'redux';
import { ThunkAction, ThunkDispatch } from 'redux-thunk';

import { Action as AuthActions } from 'app/components/auth/actions';
import { State as AuthState } from 'app/components/auth/reducer';

import { Action as BsodActions } from 'app/components/ui/bsod/actions';
import { State as BsodState } from 'app/components/ui/bsod/reducer';

import { Action as AccountActions } from 'app/components/accounts/actions/pure-actions';
import { State as AccountState } from 'app/components/accounts/reducer';

import { Action as UserActions } from 'app/components/user/actions';
import { State as UserState } from 'app/components/user/reducer';

import { Action as PopupActions } from 'app/components/ui/popup/actions';
import { State as PopupState } from 'app/components/ui/popup/reducer';

import { Action as AppsActions } from 'app/components/dev/apps/actions';
import { State as AppsState } from 'app/components/dev/apps/reducer';

import { Action as I18nActions } from 'app/components/i18n/actions';
import { State as I18nState } from 'app/components/i18n/reducer';

type PureActions = AuthActions | BsodActions | AccountActions | UserActions | PopupActions | AppsActions | I18nActions;

export interface State {
    readonly auth: AuthState;
    readonly bsod: BsodState;
    readonly accounts: AccountState;
    readonly user: UserState;
    readonly popup: PopupState;
    readonly apps: AppsState;
    readonly i18n: I18nState;
}

export type Action<R = void, S = State> = ThunkAction<R, S, undefined, PureActions>;
export type Dispatch = ThunkDispatch<State, undefined, PureActions>;
export interface Store extends ReduxStore<State, PureActions> {
    dispatch: Dispatch;
}
