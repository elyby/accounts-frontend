import { combineReducers } from 'redux';

import { routeReducer } from 'react-router-redux';

import auth from 'components/auth/reducer';
import user from 'components/user/reducer';
import accounts from 'components/accounts/reducer';
import i18n from 'components/i18n/reducer';
import popup from 'components/ui/popup/reducer';
import bsod from 'components/ui/bsod/reducer';

export default combineReducers({
    bsod,
    auth,
    user,
    accounts,
    i18n,
    popup,
    routing: routeReducer
});
