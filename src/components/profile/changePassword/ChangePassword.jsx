import React, { Component } from 'react';

import { FormattedMessage as Message } from 'react-intl';
import { Link } from 'react-router';
import Helmet from 'react-helmet';
import classNames from 'classnames';

import { LabeledInput } from 'components/ui/Form';
import buttons from 'components/ui/buttons.scss';

import styles from 'components/profile/profileForm.scss';
import messages from './ChangePassword.messages';

export default class ChangePassword extends Component {
    displayName = 'ChangePassword';

    render() {
        return (
            <div className={styles.contentWithBackButton}>
                <Link className={styles.backButton} to="/" />

                <div className={styles.form}>
                    <div className={styles.formBody}>
                        <Message {...messages.changePasswordTitle}>
                            {(pageTitle) => (
                                <h3 className={styles.title}>
                                    <Helmet title={pageTitle} />
                                    {pageTitle}
                                </h3>
                            )}
                        </Message>

                        <div className={styles.formRow}>
                            <p className={styles.description}>
                                <Message {...messages.changePasswordDescription} />
                                <br/>
                                <b>
                                    <Message {...messages.achievementLossWarning} />
                                </b>
                            </p>
                        </div>

                        <div className={styles.formRow}>
                            <LabeledInput skin="light" label={messages.newPasswordLabel} />
                        </div>

                        <div className={styles.formRow}>
                            <p className={styles.description}>
                                <Message {...messages.passwordRequirements} />
                            </p>
                        </div>

                        <div className={styles.formRow}>
                            <LabeledInput skin="light" label={messages.repeatNewPasswordLabel} />
                        </div>
                    </div>

                    <button className={classNames(buttons.green, buttons.block)}>
                        <Message {...messages.changePasswordButton} />
                    </button>
                </div>
            </div>
        );
    }
}
