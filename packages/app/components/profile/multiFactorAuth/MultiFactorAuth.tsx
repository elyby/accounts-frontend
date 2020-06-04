import React from 'react';
import { Helmet } from 'react-helmet-async';
import { FormattedMessage as Message } from 'react-intl';
import styles from 'app/components/profile/profileForm.scss';
import { BackButton } from 'app/components/profile/ProfileForm';
import { FormModel } from 'app/components/ui/form';

import MfaEnable, { MfaStep } from './MfaEnable';
import MfaDisable from './MfaDisable';

class MultiFactorAuth extends React.Component<{
    step: MfaStep;
    isMfaEnabled: boolean;
    onSubmit: (form: FormModel, sendData: () => Promise<void>) => Promise<void>;
    onComplete: () => void;
    onChangeStep: (nextStep: number) => void;
}> {
    render() {
        const { step, onSubmit, onComplete, onChangeStep, isMfaEnabled } = this.props;

        return (
            <div className={styles.contentWithBackButton}>
                <BackButton />

                <div className={styles.form}>
                    <div className={styles.formBody}>
                        <Message key="mfaTitle" defaultMessage="Two‑factor authentication">
                            {(pageTitle) => (
                                <h3 className={styles.title}>
                                    <Helmet title={pageTitle as string} />
                                    {pageTitle}
                                </h3>
                            )}
                        </Message>

                        <div className={styles.formRow}>
                            <p className={styles.description}>
                                <Message
                                    key="mfaDescription"
                                    defaultMessage="Two‑factor authentication is an extra layer of security designed to ensure you that you're the only person who can access your account, even if the password gets stolen."
                                />
                            </p>
                        </div>
                    </div>

                    {isMfaEnabled && <MfaDisable onSubmit={onSubmit} onComplete={onComplete} />}
                </div>

                {isMfaEnabled || (
                    <MfaEnable step={step} onSubmit={onSubmit} onChangeStep={onChangeStep} onComplete={onComplete} />
                )}
            </div>
        );
    }
}

export default MultiFactorAuth;
