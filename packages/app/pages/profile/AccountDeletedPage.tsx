import React, { ComponentType, useCallback, useContext } from 'react';

import { useReduxDispatch } from 'app/functions';
import { restoreAccount } from 'app/services/api/accounts';
import { updateUser } from 'app/components/user/actions';
import ProfileContext from 'app/components/profile/Context';

import AccountDeleted from 'app/components/profile/AccountDeleted';

const AccountDeletedPage: ComponentType = () => {
    const dispatch = useReduxDispatch();
    const context = useContext(ProfileContext);
    const onRestore = useCallback(async () => {
        await restoreAccount(context.userId);
        dispatch(
            updateUser({
                isDeleted: false,
            }),
        );
        context.goToProfile();
    }, [dispatch, context]);

    return <AccountDeleted onRestore={onRestore} />;
};

export default AccountDeletedPage;
