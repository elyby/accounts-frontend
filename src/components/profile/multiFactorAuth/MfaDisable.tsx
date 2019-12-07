import React from 'react';
import PropTypes from 'prop-types';
import logger from 'services/logger';
import { disable as disableMFA } from 'services/api/mfa';
import { FormModel } from 'components/ui/form';

import MfaDisableForm from './disableForm/MfaDisableForm';
import MfaStatus from './status/MfaStatus';

export default class MfaDisable extends React.Component<
  {
    onSubmit: (form: FormModel, sendData: () => Promise<void>) => Promise<void>;
    onComplete: () => void;
  },
  {
    showForm: boolean;
  }
> {
  static contextTypes = {
    userId: PropTypes.number.isRequired,
  };

  state = {
    showForm: false,
  };

  render() {
    const { showForm } = this.state;

    return showForm ? (
      <MfaDisableForm onSubmit={this.onSubmit} />
    ) : (
      <MfaStatus onProceed={this.onProceed} />
    );
  }

  onProceed = () => this.setState({ showForm: true });

  onSubmit = (form: FormModel) => {
    return this.props
      .onSubmit(form, () => {
        const { totp } = form.serialize() as { totp: string };

        return disableMFA(this.context.userId, totp);
      })
      .then(() => this.props.onComplete())
      .catch(resp => {
        const { errors } = resp || {};

        if (errors) {
          return Promise.reject(errors);
        }

        logger.error('MFA: Unexpected disable form result', {
          resp,
        });
      });
  };
}
