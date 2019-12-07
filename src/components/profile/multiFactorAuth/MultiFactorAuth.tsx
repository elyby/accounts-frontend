import React from 'react';
import Helmet from 'react-helmet';
import { FormattedMessage as Message } from 'react-intl';
import styles from 'components/profile/profileForm.scss';
import { BackButton } from 'components/profile/ProfileForm';
import { FormModel } from 'components/ui/form';

import MfaEnable, { MfaStep } from './MfaEnable';
import MfaDisable from './MfaDisable';
import messages from './MultiFactorAuth.intl.json';

class MultiFactorAuth extends React.Component<{
  step: MfaStep;
  isMfaEnabled: boolean;
  onSubmit: (form: FormModel, sendData: () => Promise<void>) => Promise<void>;
  onComplete: () => void;
  onChangeStep: (nextStep: number) => void;
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
