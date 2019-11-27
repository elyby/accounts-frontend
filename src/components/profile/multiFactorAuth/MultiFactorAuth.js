// @flow
import React, { Component } from 'react';
import Helmet from 'react-helmet';
import { FormattedMessage as Message } from 'react-intl';

import styles from 'components/profile/profileForm.scss';
import { BackButton } from 'components/profile/ProfileForm';

import MfaEnable from './MfaEnable';
import MfaDisable from './MfaDisable';
import messages from './MultiFactorAuth.intl.json';

import type { MfaStep } from './MfaEnable';

class MultiFactorAuth extends Component<{
  step: MfaStep,
  isMfaEnabled: boolean,
  onSubmit: Function,
  onComplete: Function,
  onChangeStep: Function,
}> {
  render() {
    const {
      step,
      onSubmit,
      onComplete,
      onChangeStep,
      isMfaEnabled,
    } = this.props;

    return (
      <div className={styles.contentWithBackButton}>
        <BackButton />

        <div className={styles.form}>
          <div className={styles.formBody}>
            <Message {...messages.mfaTitle}>
              {pageTitle => (
                <h3 className={styles.title}>
                  <Helmet title={pageTitle} />
                  {pageTitle}
                </h3>
              )}
            </Message>

            <div className={styles.formRow}>
              <p className={styles.description}>
                <Message {...messages.mfaDescription} />
              </p>
            </div>
          </div>

          {isMfaEnabled && (
            <MfaDisable onSubmit={onSubmit} onComplete={onComplete} />
          )}
        </div>

        {isMfaEnabled || (
          <MfaEnable
            step={step}
            onSubmit={onSubmit}
            onChangeStep={onChangeStep}
            onComplete={onComplete}
          />
        )}
      </div>
    );
  }
}

export default MultiFactorAuth;
