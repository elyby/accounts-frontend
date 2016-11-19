import AuthFlow from './AuthFlow';

import * as actions from 'components/auth/actions';

const availableActions = {
    ...actions
};

export default new AuthFlow(availableActions);
