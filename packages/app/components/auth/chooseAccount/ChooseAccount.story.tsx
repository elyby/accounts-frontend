import React from 'react';

import { AuthPresenter } from 'app/components/auth/Auth.story';

import ChooseAccount from './ChooseAccount';

export default { title: 'Components/Auth' };

// TODO: provide accounts list
// TODO: provide application name
export const ChooseAccountStory = () => <AuthPresenter factory={ChooseAccount} />;
ChooseAccountStory.storyName = 'ChooseAccount';
