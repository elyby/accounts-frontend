import React from 'react';
import { action } from '@storybook/addon-actions';

import { FormModel } from 'app/components/ui/form';
import { ProfileLayout } from 'app/components/profile/Profile.story';

import ChangePassword from './ChangePassword';

export default { title: 'Components/Profile' };

export const ChangePasswordStory = () => (
    <ProfileLayout>
        <ChangePassword
            form={new FormModel()}
            onSubmit={(form) => {
                action('onSubmit')(form);

                return Promise.resolve();
            }}
        />
    </ProfileLayout>
);
ChangePasswordStory.storyName = 'ChangePassword';
