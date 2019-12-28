import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { FormattedMessage as Message } from 'react-intl';
import Helmet from 'react-helmet';

import { Input, Button, Form, FormModel } from 'app/components/ui/form';
import { BackButton } from 'app/components/profile/ProfileForm';
import styles from 'app/components/profile/profileForm.scss';

import messages from './ChangeUsername.intl.json';

export default class ChangeUsername extends Component {
  static displayName = 'ChangeUsername';

  static propTypes = {
    username: PropTypes.string.isRequired,
    form: PropTypes.instanceOf(FormModel),
    onChange: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
  };

  static get defaultProps() {
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
                    <Helmet title={pageTitle} />
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

  onUsernameChange = event => {
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