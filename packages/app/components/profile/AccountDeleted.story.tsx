import React from 'react';
import { action } from '@storybook/addon-actions';

import { ProfileLayout } from 'app/components/profile/Profile.story';

import AccountDeleted from './AccountDeleted';

export default { title: 'Components/Profile' };

export const AccountDeletedStory = () => (
    <ProfileLayout>
        <AccountDeleted
            onRestore={() =>
                new Promise((resolve) => {
                    action('onRestore')();
                    setTimeout(resolve, 500);
                })
            }
        />
    </ProfileLayout>
);
AccountDeletedStory.storyName = 'AccountDeleted';
