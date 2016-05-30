import AuthFlow from './authFlow/AuthFlow';

import * as actions from 'components/auth/actions';
import {updateUser} from 'components/user/actions';

const availableActions = {
    ...actions,
    updateUser
};

export default new AuthFlow(availableActions);
