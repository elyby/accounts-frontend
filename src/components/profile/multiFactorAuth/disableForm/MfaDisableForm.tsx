import React from 'react';
import { FormattedMessage as Message } from 'react-intl';
import { Button, Input, Form, FormModel } from 'components/ui/form';
import styles from 'components/profile/profileForm.scss';

import messages from '../MultiFactorAuth.intl.json';
import mfaStyles from '../mfa.scss';

export default class MfaDisableForm extends React.Component<{
  onSubmit: (form: FormModel) => Promise<void>;
}> {
  form: FormModel = new FormModel();

  render() {
    const { form } = this;
    const { onSubmit } = this.props;

    return (
      <Form form={form} onSubmit={onSubmit}>
        <div className={styles.formBody}>
          <div className={styles.formRow}>
            <p className={`${styles.description} ${mfaStyles.mfaTitle}`}>
              <Message {...messages.disableMfa} />
            </p>
          </div>

          <div className={styles.formRow}>
            <p className={styles.description}>
              <Message {...messages.disableMfaInstruction} />
            </p>
          </div>

          <div className={styles.formRow}>
            <Input
              {...form.bindField('totp')}
              required
              autoFocus
              autoComplete="off"
              skin="light"
              placeholder={messages.codePlaceholder}
            />
          </div>
        </div>

        <Button type="submit" color="green" block label={messages.disable} />
      </Form>
    );
  }
}
