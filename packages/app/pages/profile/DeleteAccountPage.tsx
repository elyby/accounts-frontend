import React, { ComponentType, useCallback, useContext, useRef } from 'react';

import { useReduxDispatch } from 'app/functions';
import { changePassword } from 'app/services/api/accounts';
import { FormModel } from 'app/components/ui/form';
import DeleteAccount from 'app/components/profile/deleteAccount';
import { updateUser } from 'app/components/user/actions';
import ProfileContext from 'app/components/profile/Context';

const DeleteAccountPage: ComponentType = () => {
    const context = useContext(ProfileContext);
    const dispatch = useReduxDispatch();
    const { current: form } = useRef(new FormModel());
    const onSubmit = useCallback(
        () =>
            context
                .onSubmit({
                    form,
                    // TODO: rework
                    sendData: () => changePassword(context.userId, form.serialize()),
                })
                .then(() => {
                    dispatch(
                        updateUser({
                            passwordChangedAt: Date.now() / 1000,
                        }),
                    );
                    context.goToProfile();
                }),
        [context],
    );

    return <DeleteAccount onSubmit={onSubmit} />;
};

export default DeleteAccountPage;
