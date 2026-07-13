import React, { ComponentType, PropsWithChildren } from 'react';

import rootStyles from 'app/pages/root/root.scss';
import profileStyles from 'app/pages/profile/profile.scss';

import Profile from './Profile';

export const ProfileLayout: ComponentType = ({ children }) => (
    <div className={rootStyles.wrapper}>
        <div className={profileStyles.container}>{children}</div>
    </div>
);

export default {
    title: 'Components/Profile',
    excludeStories: /.*Layout$/,
};

export const ProfileStory = () => (
    <ProfileLayout>
        <Profile
            user={{
                id: 1,
                username: 'ErickSkrauch',
                email: 'erickskrauch@ely.by',
                hasMojangUsernameCollision: true,
                isGuest: false,
                isDeleted: false,
                isOtpEnabled: true,
                lang: 'unknown',
                passwordChangedAt: 1595328712,
                uuid: 'f82f5f58-918c-4b22-8232-b28849775547',
                shouldAcceptRules: false,
                avatar: '',
                token: '',
            }}
            activeLocale={'en'}
        />
    </ProfileLayout>
);
ProfileStory.storyName = 'Profile';
