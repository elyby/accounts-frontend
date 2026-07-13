import React from 'react';

import { AuthPresenter } from 'app/components/auth/Auth.story';

import Activation from './Activation';

export default { title: 'Components/Auth' };

// TODO: add case with provided key
export const ActivationStory = () => <AuthPresenter factory={Activation} />;
ActivationStory.storyName = 'Activation';
