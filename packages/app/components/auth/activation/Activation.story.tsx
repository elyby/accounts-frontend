import React from 'react';
import { storiesOf } from '@storybook/react';

import { AuthPresenter } from 'app/components/auth/Auth.story';

import Activation from './Activation';

// TODO: add case with provided key
storiesOf('Components/Auth', module).add('Activation', () => <AuthPresenter factory={Activation} />);
