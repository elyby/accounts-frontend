import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import { ProfileLayout } from 'app/components/profile/Profile.story';

import ChangeEmail from './ChangeEmail';

storiesOf('Components/Profile/ChangeEmail', module)
    .addDecorator((story) => <ProfileLayout>{story()}</ProfileLayout>)
    .add('First step', () => (
        <ChangeEmail
            step={0}
            email="initial-email@ely.by"
            onSubmit={(step, form) => {
                action('onSubmit')(step, form);

                return Promise.resolve();
            }}
            onChangeStep={action('onChangeStep')}
        />
    ))
    .add('Second step', () => (
        <ChangeEmail
            step={1}
            email="email-from-prev-step@ely.by"
            onSubmit={(step, form) => {
                action('onSubmit')(step, form);

                return Promise.resolve();
            }}
            onChangeStep={action('onChangeStep')}
        />
    ))
    .add('Second step with code', () => (
        <ChangeEmail
            step={1}
            code="I7SP06BUTLLM8MA03O"
            onSubmit={(step, form) => {
                action('onSubmit')(step, form);

                return Promise.resolve();
            }}
            onChangeStep={action('onChangeStep')}
        />
    ))
    .add('Third step', () => (
        <ChangeEmail
            step={2}
            onSubmit={(step, form) => {
                action('onSubmit')(step, form);

                return Promise.resolve();
            }}
            onChangeStep={action('onChangeStep')}
        />
    ))
    .add('Third step with code', () => (
        <ChangeEmail
            step={2}
            code="I7SP06BUTLLM8MA03O"
            onSubmit={(step, form) => {
                action('onSubmit')(step, form);

                return Promise.resolve();
            }}
            onChangeStep={action('onChangeStep')}
        />
    ));
