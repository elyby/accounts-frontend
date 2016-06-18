import { combineReducers } from 'redux';

import { routeReducer } from 'react-router-redux';

import auth from 'components/auth/reducer';
import user from 'components/user/reducer';
import i18n from 'components/i18n/reducer';
import popup from 'components/ui/popup/reducer';

export default combineReducers({
    auth,
    user,
    i18n,
    popup,
    routing: routeReducer
});
