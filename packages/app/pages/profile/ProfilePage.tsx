import React, { ComponentType } from 'react';
import { useSelector } from 'react-redux';

import { RootState } from 'app/reducers';

import Profile from 'app/components/profile/Profile';

const ProfileController: ComponentType = () => {
    const [user, activeLocale] = useSelector((state: RootState) => [state.user, state.i18n.locale]);

    return <Profile user={user} activeLocale={activeLocale} />;
};

export default ProfileController;
