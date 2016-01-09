import React, { Component } from 'react';

import { FormattedMessage as Message } from 'react-intl';
import classNames from 'classnames';

import buttons from 'components/ui/buttons.scss';
import icons from 'components/ui/icons.scss';
import { Panel, PanelBody, PanelFooter, PanelBodyHeader } from 'components/ui/Panel';
import { Input, Checkbox } from 'components/ui/Form';

import styles from './signIn.scss';
import messages from './SignIn.messages';


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
                            <PanelBodyHeader type="error">
                                <Message {...messages.invalidPassword} />
                                <br/>
                                <Message {...messages.suggestResetPassword} values={{
                                    link: (
                                        <a href="#">
                                            <Message {...messages.forgotYourPassword} />
                                        </a>
                                    )
                                }} />
                            </PanelBodyHeader>
                            <div className={styles.miniProfile}>
                                <div className={styles.avatar}>
                                    {/*<img src="//lorempixel.com/g/90/90" />*/}
                                    <span className={icons.user} />
                                </div>
                                <div className={styles.email}>
                                    erickskrauch@yandex.ru
                                </div>
                            </div>
                            <Input icon="key" type="password" placeholder="Account password" />

                            <Checkbox label={<Message {...messages.rememberMe} />} />
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
                            <PanelBodyHeader>
                                <div className={styles.authInfo}>
                                    <div className={styles.authInfoAvatar}>
                                        {/*<img src="//lorempixel.com/g/90/90" />*/}
                                        <span className={icons.user} />
                                    </div>
                                    <div className={styles.authInfoTitle}>
                                        <Message {...messages.youAuthorizedAs} />
                                    </div>
                                    <div className={styles.authInfoEmail}>
                                        erickskrauch@yandex.ru
                                    </div>
                                </div>
                            </PanelBodyHeader>
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
                            {/* TODO: E-mail i18n*/}
                            <Input icon="user" color="blue" type="text" placeholder="Your nickname" />
                            {/* TODO: E-mail i18n*/}
                            <Input icon="envelope" color="blue" type="email" placeholder="Your E-mail" />
                            {/* TODO: Account password i18n*/}
                            <Input icon="key" color="blue" type="password" placeholder="Account password" />
                            {/* TODO: Account password i18n*/}
                            <Input icon="key" color="blue" type="password" placeholder="Repeat password" />

                            <Checkbox color="blue" label={
                                <Message {...messages.acceptRules} values={{
                                    link: (
                                        <a href="#">
                                            <Message {...messages.termsOfService} />
                                        </a>
                                    )
                                }} />
                            } />
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
                                <div className={styles.descriptionImage} />

                                <div className={styles.descriptionText}>
                                    <Message {...messages.activationMailWasSent} values={{
                                        email: (<b>erickskrauch@yandex.ru</b>)
                                    }} />
                                </div>
                            </div>
                            <div className={styles.formRow}>
                                {/* TODO: E-mail i18n*/}
                                <Input type="email" color="blue" placeholder="Enter the code from E-mail here" />
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
