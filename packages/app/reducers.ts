import { combineReducers } from 'redux';

import auth from 'app/components/auth/reducer';
import user from 'app/components/user/reducer';
import accounts from 'app/components/accounts/reducer';
import i18n from 'app/components/i18n/reducer';
import popup from 'app/components/ui/popup/reducer';
import bsod from 'app/components/ui/bsod/reducer';
import apps from 'app/components/dev/apps/reducer';

import { State } from 'app/types';

export default combineReducers<State>({
    bsod,
    auth,
    user,
    accounts,
    i18n,
    popup,
    apps,
});
