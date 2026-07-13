import React from 'react';
import { action } from '@storybook/addon-actions';

import { FormModel } from 'app/components/ui/form';

import PasswordRequestForm from './PasswordRequestForm';

export default { title: 'Components/Popups/PasswordRequestForm' };

export const Empty = () => <PasswordRequestForm form={new FormModel()} onSubmit={action('onSubmit')} />;

export const WithError = () => {
    const form = new FormModel();
    form.bindField('password');
    form.errors['password'] = 'error.password_incorrect';

    return <PasswordRequestForm form={form} onSubmit={action('onSubmit')} />;
};
WithError.storyName = 'with error';
