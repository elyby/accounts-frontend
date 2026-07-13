import React from 'react';

import { AuthPresenter } from 'app/components/auth/Auth.story';

import AcceptRules from './AcceptRules';

export default { title: 'Components/Auth' };

export const AcceptRulesStory = () => <AuthPresenter factory={AcceptRules} />;
AcceptRulesStory.storyName = 'AcceptRules';
