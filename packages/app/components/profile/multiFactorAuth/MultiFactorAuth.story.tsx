import React from 'react';
import { action } from '@storybook/addon-actions';

import { ProfileLayout } from 'app/components/profile/Profile.story';

import MultiFactorAuth from './MultiFactorAuth';

export default {
    title: 'Components/Profile/MultiFactorAuth',
    decorators: [(story: () => React.ReactElement) => <ProfileLayout>{story()}</ProfileLayout>],
};

export const FirstStep = () => (
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
);
FirstStep.storyName = 'First step';

export const SecondStep = () => (
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
);
SecondStep.storyName = 'Second step';

export const ThirdStep = () => (
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
);
ThirdStep.storyName = 'Third step';

export const Enabled = () => (
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
);
