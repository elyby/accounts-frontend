import React, { ComponentType } from 'react';

import { useReduxSelector } from 'app/functions';

import Profile from 'app/components/profile/Profile';

const ProfileController: ComponentType = () => {
    const [user, activeLocale] = useReduxSelector((state) => [state.user, state.i18n.locale]);

    return <Profile user={user} activeLocale={activeLocale} />;
};

export default ProfileController;
