import React from 'react';
import { FormattedMessage as Message } from 'react-intl';
import { Helmet } from 'react-helmet-async';
import { Input, Button, Form, FormModel } from 'app/components/ui/form';
import { BackButton } from 'app/components/profile/ProfileForm';

import styles from '../profileForm.scss';
import messages from './ChangeUsername.intl.json';

interface Props {
  username: string;
  form: FormModel;
  onChange: (name: string) => void;
  onSubmit: (form: FormModel) => Promise<void>;
}

export default class ChangeUsername extends React.Component<Props> {
  static get defaultProps(): Partial<Props> {
    return {
      form: new FormModel(),
    };
  }

  render() {
    const { form, username } = this.props;

    return (
      <Form onSubmit={this.onFormSubmit} form={form}>
        <div className={styles.contentWithBackButton}>
          <BackButton />

          <div className={styles.form}>
            <div className={styles.formBody}>
              <Message {...messages.changeUsernameTitle}>
                {pageTitle => (
                  <h3 className={styles.title}>
                    <Helmet title={pageTitle as string} />
                    {pageTitle}
                  </h3>
                )}
              </Message>

              <div className={styles.formRow}>
                <p className={styles.description}>
                  <Message {...messages.changeUsernameDescription} />
                </p>
              </div>

              <div className={styles.formRow}>
                <Input
                  {...form.bindField('username')}
                  value={username}
                  onChange={this.onUsernameChange}
                  required
                  skin="light"
                />
              </div>

              <div className={styles.formRow}>
                <p className={styles.description}>
                  <Message {...messages.changeUsernameWarning} />
                </p>
              </div>
            </div>

            <Button
              color="green"
              block
              label={messages.changeUsernameButton}
              type="submit"
            />
          </div>
        </div>
      </Form>
    );
  }

  onUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.props.onChange(event.target.value);
  };

  onFormSubmit = () => {
    const { form } = this.props;

    this.props.onSubmit(form).catch(resp => {
      if (resp.errors) {
        form.setErrors(resp.errors);
      } else {
        return Promise.reject(resp);
      }
    });
  };
}
