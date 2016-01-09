import React, { Component } from 'react';

import { FormattedMessage as Message } from 'react-intl';
import classNames from 'classnames';

import buttons from 'components/ui/buttons.scss';
import icons from 'components/ui/icons.scss';
import { Panel, PanelBody, PanelFooter } from 'components/ui/Panel';
import { Input } from 'components/ui/Form';

import styles from './signIn.scss';
import messages from './SignIn.messages';


import panel from 'components/ui/panel.scss';

// 0.5s cubic-bezier(0.075, 0.82, 0.165, 1)

/**
 * Forms:
 * Register
 * - RegisterForm
 * - ConfirmRegister
 *
 * SignIn
 * - Email
 * - Password
 * - Permissions
 */

export default class SignIn extends Component {
    displayName = 'SignIn';

    render() {
        return (
            <div>
                <div className={styles.signIn}>
                    <Panel title={<Message {...messages.signInTitle} />}>
                        <PanelBody>
                            <Input icon="envelope" type="email" placeholder="E-mail" />
                        </PanelBody>
                        <PanelFooter>
                            <button className={buttons.green}>
                                <Message {...messages.next} />
                            </button>
                        </PanelFooter>
                    </Panel>
                    <div className={styles.helpLinks}>
                        <a href="#">
                            <Message {...messages.forgotPassword} />
                        </a>
                        {' | '}
                        <a href="#">
                            <Message {...messages.contactSupport} />
                        </a>
                    </div>
                </div>
                <div className={styles.signIn}>
                    <Panel icon="arrowLeft" title={<Message {...messages.enterPassword} />}>
                        <PanelBody>
                            <div className={styles.error}>
                                <Message {...messages.invalidPassword} />
                                <br/>
                                <Message {...messages.suggestResetPassword} values={{
                                    link: (
                                        <a href="#">
                                            <Message {...messages.forgotYourPassword} />
                                        </a>
                                    )
                                }} />
                            </div>
                            <div className={styles.miniProfile}>
                                <div className={styles.avatar}>
                                    <img src="//lorempixel.com/g/90/90" />
                                </div>
                                <div className={styles.email}>
                                    erickskrauch@yandex.ru
                                </div>
                            </div>
                            <div className={styles.formIconRow}>
                                <Input icon="key" type="password" placeholder="Account password" />
                            </div>

                            <div className={styles.checkboxRow}>
                                <label>
                                    <input type="checkbox" />
                                    <Message {...messages.rememberMe} />
                                </label>
                            </div>
                        </PanelBody>
                        <PanelFooter>
                            <button className={buttons.green}>
                                <Message {...messages.signInButton} />
                            </button>
                        </PanelFooter>
                    </Panel>
                    <div className={styles.helpLinks}>
                        <a href="#">
                            <Message {...messages.forgotPassword} />
                        </a>
                        {' | '}
                        <a href="#">
                            <Message {...messages.contactSupport} />
                        </a>
                    </div>
                </div>
                <div className={styles.signIn}>
                    <Panel title={<Message {...messages.permissionsTitle} />}>
                        <PanelBody>
                            <div className={styles.authInfo}>
                                <div className={styles.avatar}>
                                    <img src="//lorempixel.com/g/90/90" />
                                </div>
                                <div className={styles.email}>
                                    <Message {...messages.youAuthorizedAs} />
                                </div>
                                <div className={styles.email}>
                                    erickskrauch@yandex.ru
                                </div>
                            </div>
                            <div className={styles.disclaimer}>
                                <Message {...messages.theAppNeedsAccess} />
                            </div>
                            <ul className={styles.permissionsList}>
                                <li>
                                    one two three
                                </li>
                                <li>
                                    one two three
                                </li>
                                <li>
                                    one two three
                                </li>
                                <li>
                                    one two three
                                </li>
                            </ul>
                        </PanelBody>
                        <PanelFooter>
                            <button className={classNames(buttons.black, styles.decline)}>
                                <Message {...messages.decline} />
                            </button>
                            <button className={buttons.green}>
                                <Message {...messages.approve} />
                            </button>
                        </PanelFooter>
                    </Panel>
                    <div className={styles.helpLinks}>
                        <a href="#">
                            <Message {...messages.contactSupport} />
                        </a>
                    </div>
                </div>
                <div className={styles.signIn}>
                    <Panel title={<Message {...messages.signUpTitle} />}>
                        <PanelBody>
                            <div className={styles.formIconRow}>
                                {/* TODO: E-mail i18n*/}
                                <Input icon="user" type="text" placeholder="Your nickname" />
                            </div>
                            <div className={styles.formIconRow}>
                                {/* TODO: E-mail i18n*/}
                                <Input icon="envelope" type="email" placeholder="Your E-mail" />
                            </div>
                            <div className={styles.formIconRow}>
                                {/* TODO: Account password i18n*/}
                                <Input icon="key" type="password" placeholder="Account password" />
                            </div>
                            <div className={styles.formIconRow}>
                                {/* TODO: Account password i18n*/}
                                <Input icon="key" type="password" placeholder="Repeat password" />
                            </div>

                            <div className={styles.checkboxRow}>
                                <label>
                                    <input type="checkbox" />
                                    <Message {...messages.acceptRules} values={{
                                        link: (
                                            <a href="#">
                                                <Message {...messages.termsOfService} />
                                            </a>
                                        )
                                    }} />
                                </label>
                            </div>
                        </PanelBody>
                        <PanelFooter>
                            <button className={buttons.blue}>
                                <Message {...messages.signUpButton} />
                            </button>
                        </PanelFooter>
                    </Panel>
                    <div className={styles.helpLinks}>
                        <a href="#">
                            <Message {...messages.contactSupport} />
                        </a>
                    </div>
                </div>
                <div className={styles.signIn}>
                    <Panel icon="arrowLeft" title={<Message {...messages.accountActivationTitle} />}>
                        <PanelBody>
                            <div className={styles.description}>
                                <div className={styles.descriptionImage}>
                                    <span className={icons.envelope} />
                                </div>
                                <div className={styles.descriptionText}>
                                    <Message {...messages.activationMailWasSent} values={{
                                        email: (<b>erickskrauch@yandex.ru</b>)
                                    }} />
                                </div>
                            </div>
                            <div className={styles.formRow}>
                                {/* TODO: E-mail i18n*/}
                                <Input type="email" placeholder="Enter the code from E-mail here" />
                            </div>
                        </PanelBody>
                        <PanelFooter>
                            <button className={buttons.blue}>
                                <Message {...messages.confirmEmail} />
                            </button>
                        </PanelFooter>
                    </Panel>
                    <div className={styles.helpLinks}>
                        <a href="#">
                            <Message {...messages.didNotReceivedEmail} />
                        </a>
                        {' | '}
                        <a href="#">
                            <Message {...messages.contactSupport} />
                        </a>
                    </div>
                </div>
            </div>
        );
    }
}
