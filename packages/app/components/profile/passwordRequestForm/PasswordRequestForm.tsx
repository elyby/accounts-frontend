import React, { ComponentType } from 'react';
import { FormattedMessage as Message } from 'react-intl';
import clsx from 'clsx';

import { Form, Button, Input, FormModel } from 'app/components/ui/form';
import popupStyles from 'app/components/ui/popup/popup.scss';

import styles from './passwordRequestForm.scss';
import messages from './PasswordRequestForm.intl.json';

interface Props {
  form: FormModel;
  onSubmit: (form: FormModel) => void;
}

const PasswordRequestForm: ComponentType<Props> = ({ form, onSubmit }) => (
  <div
    className={styles.requestPasswordForm}
    data-testid="password-request-form"
  >
    <div className={popupStyles.popup}>
      <Form onSubmit={onSubmit} form={form}>
        <div className={popupStyles.header}>
          <h2 className={popupStyles.headerTitle}>
            <Message {...messages.title} />
          </h2>
        </div>

        <div className={clsx(popupStyles.body, styles.body)}>
          <span className={styles.lockIcon} />

          <div className={styles.description}>
            <Message {...messages.description} />
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
        <Button color="green" label={messages.continue} block type="submit" />
      </Form>
    </div>
  </div>
);

export default PasswordRequestForm;
