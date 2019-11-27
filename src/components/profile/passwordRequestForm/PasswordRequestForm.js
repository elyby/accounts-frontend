import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { FormattedMessage as Message } from 'react-intl';

import classNames from 'classnames';

import { Form, Button, Input, FormModel } from 'components/ui/form';
import popupStyles from 'components/ui/popup/popup.scss';
import styles from './passwordRequestForm.scss';

import messages from './PasswordRequestForm.intl.json';

export default class PasswordRequestForm extends Component {
  static displayName = 'PasswordRequestForm';

  static propTypes = {
    form: PropTypes.instanceOf(FormModel).isRequired,
    onSubmit: PropTypes.func.isRequired,
  };

  render() {
    const { form } = this.props;

    return (
      <div className={styles.requestPasswordForm}>
        <div className={popupStyles.popup}>
          <Form onSubmit={this.onFormSubmit} form={form}>
            <div className={popupStyles.header}>
              <h2 className={popupStyles.headerTitle}>
                <Message {...messages.title} />
              </h2>
            </div>

            <div className={classNames(popupStyles.body, styles.body)}>
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
            <Button
              color="green"
              label={messages.continue}
              block
              type="submit"
            />
          </Form>
        </div>
      </div>
    );
  }

  onFormSubmit = () => {
    this.props.onSubmit(this.props.form);
  };
}
