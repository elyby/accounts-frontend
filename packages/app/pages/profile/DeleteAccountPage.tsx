import React, { ComponentType, useCallback, useContext, useRef } from 'react';

import { useReduxDispatch } from 'app/functions';
import { deleteAccount } from 'app/services/api/accounts';
import { FormModel } from 'app/components/ui/form';
import DeleteAccount from 'app/components/profile/deleteAccount';
import { updateUser } from 'app/components/user/actions';
import { markAsDeleted } from 'app/components/accounts/actions/pure-actions';
import ProfileContext from 'app/components/profile/Context';

const DeleteAccountPage: ComponentType = () => {
    const context = useContext(ProfileContext);
    const dispatch = useReduxDispatch();
    const { current: form } = useRef(new FormModel());
    const onSubmit = useCallback(async () => {
        await context.onSubmit({
            form,
            sendData: () => deleteAccount(context.userId, form.serialize()),
        });
        dispatch(
            updateUser({
                isDeleted: true,
            }),
        );
        dispatch(markAsDeleted(true));
        context.goToProfile();
    }, [context]);

    return <DeleteAccount onSubmit={onSubmit} />;
};

export default DeleteAccountPage;
