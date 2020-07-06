import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import { FormModel } from 'app/components/ui/form';

import PasswordRequestForm from './PasswordRequestForm';

storiesOf('Components/Popups/PasswordRequestForm', module)
    .add('empty', () => <PasswordRequestForm form={new FormModel()} onSubmit={action('onSubmit')} />)
    .add('with error', () => {
        const form = new FormModel();
        form.bindField('password');
        form.errors['password'] = 'error.password_incorrect';

        return <PasswordRequestForm form={form} onSubmit={action('onSubmit')} />;
    });
