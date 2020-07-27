import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import { ProfileLayout } from 'app/components/profile/Profile.story';

import AccountDeleted from './AccountDeleted';

storiesOf('Components/Profile', module).add('AccountDeleted', () => (
    <ProfileLayout>
        <AccountDeleted onRestore={action('onRestore')} />
    </ProfileLayout>
));
