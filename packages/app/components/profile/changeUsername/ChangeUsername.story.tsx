import React from 'react';
import { action } from '@storybook/addon-actions';

import { FormModel } from 'app/components/ui/form';
import { ProfileLayout } from 'app/components/profile/Profile.story';

import ChangeUsername from './ChangeUsername';

export default { title: 'Components/Profile' };

export const ChangeUsernameStory = () => (
    <ProfileLayout>
        <ChangeUsername
            form={new FormModel()}
            username="InitialUsername"
            onChange={action('onChange')}
            onSubmit={(form) => {
                action('onSubmit')(form);

                return Promise.resolve();
            }}
        />
    </ProfileLayout>
);
ChangeUsernameStory.storyName = 'ChangeUsername';
