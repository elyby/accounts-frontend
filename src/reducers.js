import { combineReducers } from 'redux';

import auth from 'components/auth/reducer';
import user from 'components/user/reducer';
import accounts from 'components/accounts/reducer';
import i18n from 'components/i18n/reducer';
import popup from 'components/ui/popup/reducer';
import bsod from 'components/ui/bsod/reducer';
import apps from 'components/dev/apps/reducer';

export default combineReducers({
    bsod,
    auth,
    user,
    accounts,
    i18n,
    popup,
    apps,
});
