import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import { FormModel } from 'app/components/ui/form';
import { ProfileLayout } from 'app/components/profile/Profile.story';

import ChangePassword from './ChangePassword';

storiesOf('Components/Profile', module).add('ChangePassword', () => (
    <ProfileLayout>
        <ChangePassword
            form={new FormModel()}
            onSubmit={(form) => {
                action('onSubmit')(form);

                return Promise.resolve();
            }}
        />
    </ProfileLayout>
));
