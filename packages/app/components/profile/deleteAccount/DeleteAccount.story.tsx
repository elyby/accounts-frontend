import React from 'react';
import { action } from '@storybook/addon-actions';

import { ProfileLayout } from 'app/components/profile/Profile.story';

import DeleteAccount from './DeleteAccount';

export default { title: 'Components/Profile' };

export const DeleteAccountStory = () => (
    <ProfileLayout>
        <DeleteAccount
            onSubmit={async () => {
                action('onSubmit')();
            }}
        />
    </ProfileLayout>
);
DeleteAccountStory.storyName = 'DeleteAccount';
