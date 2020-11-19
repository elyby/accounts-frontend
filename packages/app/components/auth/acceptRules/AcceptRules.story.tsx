import React from 'react';
import { storiesOf } from '@storybook/react';

import { AuthPresenter } from 'app/components/auth/Auth.story';

import AcceptRules from './AcceptRules';

storiesOf('Components/Auth', module).add('AcceptRules', () => <AuthPresenter factory={AcceptRules} />);
