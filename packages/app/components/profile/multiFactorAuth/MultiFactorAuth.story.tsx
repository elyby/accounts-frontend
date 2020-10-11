import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import { ProfileLayout } from 'app/components/profile/Profile.story';

import MultiFactorAuth from './MultiFactorAuth';

storiesOf('Components/Profile/MultiFactorAuth', module)
    .addDecorator((story) => <ProfileLayout>{story()}</ProfileLayout>)
    .add('First step', () => (
        <MultiFactorAuth
            isMfaEnabled={false}
            step={0}
            onSubmit={(form, sendData) => {
                action('onSubmit')(form, sendData);

                return Promise.resolve();
            }}
            onComplete={action('onComplete')}
            onChangeStep={action('onChangeStep')}
        />
    ))
    .add('Second step', () => (
        <MultiFactorAuth
            isMfaEnabled={false}
            step={1}
            onSubmit={(form, sendData) => {
                action('onSubmit')(form, sendData);

                return Promise.resolve();
            }}
            onComplete={action('onComplete')}
            onChangeStep={action('onChangeStep')}
        />
    ))
    .add('Third step', () => (
        <MultiFactorAuth
            isMfaEnabled={false}
            step={2}
            onSubmit={(form, sendData) => {
                action('onSubmit')(form, sendData);

                return Promise.resolve();
            }}
            onComplete={action('onComplete')}
            onChangeStep={action('onChangeStep')}
        />
    ))
    .add('Enabled', () => (
        <MultiFactorAuth
            isMfaEnabled
            step={0}
            onSubmit={(form, sendData) => {
                action('onSubmit')(form, sendData);

                return Promise.resolve();
            }}
            onComplete={action('onComplete')}
            onChangeStep={action('onChangeStep')}
        />
    ));
