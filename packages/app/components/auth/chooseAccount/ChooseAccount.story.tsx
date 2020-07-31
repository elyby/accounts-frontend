import React from 'react';
import { storiesOf } from '@storybook/react';

import { AuthPresenter } from 'app/components/auth/Auth.story';

import ChooseAccount from './ChooseAccount';

// TODO: provide accounts list
// TODO: provide application name
storiesOf('Components/Auth', module).add('ChooseAccount', () => <AuthPresenter factory={ChooseAccount} />);
