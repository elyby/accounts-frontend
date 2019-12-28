import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { FormattedMessage as Message } from 'react-intl';
import Helmet from 'react-helmet';
import {
  Input,
  Button,
  Checkbox,
  Form,
  FormModel,
} from 'app/components/ui/form';
import { BackButton } from 'app/components/profile/ProfileForm';

import styles from 'app/components/profile/profileForm.scss';
import messages from './ChangePassword.intl.json';

export default class ChangePassword extends Component {
  static displayName = 'ChangePassword';

  static propTypes = {
    form: PropTypes.instanceOf(FormModel),
    onSubmit: PropTypes.func.isRequired,
  };

  static get defaultProps() {
    return {
      form: new FormModel(),
    };
  }

  render() {
    const { form } = this.props;

    return (
      <Form onSubmit={this.onFormSubmit} form={form}>
        <div className={styles.contentWithBackButton}>
          <BackButton />

          <div className={styles.form}>
            <div className={styles.formBody}>
              <Message {...messages.changePasswordTitle}>
                {pageTitle => (
                  <h3 className={styles.title}>
                    <Helmet title={pageTitle} />
                    {pageTitle}
                  </h3>
                )}
              </Message>

              <div className={styles.formRow}>
                <p className={styles.description}>
                  <Message {...messages.changePasswordDescription} />
                  <br />
                  <b>
                    <Message {...messages.achievementLossWarning} />
                  </b>
                </p>
              </div>

              <div className={styles.formRow}>
                <Input
                  {...form.bindField('newPassword')}
                  type="password"
                  required
                  skin="light"
                  label={messages.newPasswordLabel}
                />
              </div>

              <div className={styles.formRow}>
                <p className={styles.description}>
                  <Message {...messages.passwordRequirements} />
                </p>
              </div>

              <div className={styles.formRow}>
                <Input
                  {...form.bindField('newRePassword')}
                  type="password"
                  required
                  skin="light"
                  label={messages.repeatNewPasswordLabel}
                />
              </div>

              <div className={styles.formRow}>
                <Checkbox
                  {...form.bindField('logoutAll')}
                  defaultChecked
                  skin="light"
                  label={messages.logoutOnAllDevices}
                />
              </div>
            </div>

            <Button
              color="green"
              block
              label={messages.changePasswordButton}
              type="submit"
            />
          </div>
        </div>
      </Form>
    );
  }

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