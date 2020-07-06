import React, { ComponentType } from 'react';
import { FormattedMessage as Message } from 'react-intl';

import Popup from 'app/components/ui/popup';
import { Form, Button, Input, FormModel } from 'app/components/ui/form';

import styles from './passwordRequestForm.scss';

interface Props {
    form: FormModel;
    onSubmit?: (form: FormModel) => void;
}

const PasswordRequestForm: ComponentType<Props> = ({ form, onSubmit }) => (
    <Popup
        title={<Message key="title" defaultMessage="Confirm your action" />}
        wrapperClassName={styles.boundings}
        isClosable={false}
        data-testid="password-request-form"
    >
        <Form onSubmit={onSubmit} form={form}>
            <div className={styles.body}>
                <span className={styles.lockIcon} />

                <div className={styles.description}>
                    <Message key="description" defaultMessage="To complete action enter the account password" />
                </div>

                <Input
                    {...form.bindField('password')}
                    type="password"
                    required
                    autoFocus
                    color="green"
                    skin="light"
                    center
                />
            </div>

            <Button type="submit" color="green" label={<Message key="continue" defaultMessage="Continue" />} block />
        </Form>
    </Popup>
);

export default PasswordRequestForm;
