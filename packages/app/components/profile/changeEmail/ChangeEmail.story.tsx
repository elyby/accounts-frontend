import React from 'react';
import { action } from '@storybook/addon-actions';

import { ProfileLayout } from 'app/components/profile/Profile.story';

import ChangeEmail from './ChangeEmail';

export default {
    title: 'Components/Profile/ChangeEmail',
    decorators: [(story: () => React.ReactElement) => <ProfileLayout>{story()}</ProfileLayout>],
};

export const FirstStep = () => (
    <ChangeEmail
        step={0}
        email="initial-email@ely.by"
        onSubmit={(step, form) => {
            action('onSubmit')(step, form);

            return Promise.resolve();
        }}
        onChangeStep={action('onChangeStep')}
    />
);
FirstStep.storyName = 'First step';

export const SecondStep = () => (
    <ChangeEmail
        step={1}
        email="email-from-prev-step@ely.by"
        onSubmit={(step, form) => {
            action('onSubmit')(step, form);

            return Promise.resolve();
        }}
        onChangeStep={action('onChangeStep')}
    />
);
SecondStep.storyName = 'Second step';

export const SecondStepWithCode = () => (
    <ChangeEmail
        step={1}
        code="I7SP06BUTLLM8MA03O"
        onSubmit={(step, form) => {
            action('onSubmit')(step, form);

            return Promise.resolve();
        }}
        onChangeStep={action('onChangeStep')}
    />
);
SecondStepWithCode.storyName = 'Second step with code';

export const ThirdStep = () => (
    <ChangeEmail
        step={2}
        onSubmit={(step, form) => {
            action('onSubmit')(step, form);

            return Promise.resolve();
        }}
        onChangeStep={action('onChangeStep')}
    />
);
ThirdStep.storyName = 'Third step';

export const ThirdStepWithCode = () => (
    <ChangeEmail
        step={2}
        code="I7SP06BUTLLM8MA03O"
        onSubmit={(step, form) => {
            action('onSubmit')(step, form);

            return Promise.resolve();
        }}
        onChangeStep={action('onChangeStep')}
    />
);
ThirdStepWithCode.storyName = 'Third step with code';
