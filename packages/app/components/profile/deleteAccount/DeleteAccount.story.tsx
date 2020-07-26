import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import { ProfileLayout } from 'app/components/profile/Profile.story';

import DeleteAccount from './DeleteAccount';

storiesOf('Components/Profile', module).add('DeleteAccount', () => (
    <ProfileLayout>
        <DeleteAccount
            onSubmit={() => {
                action('onSubmit')();

                return Promise.resolve();
            }}
        />
    </ProfileLayout>
));
