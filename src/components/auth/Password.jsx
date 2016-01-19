import React, { Component } from 'react';

import { FormattedMessage as Message } from 'react-intl';
import Helmet from 'react-helmet';

import buttons from 'components/ui/buttons.scss';
import icons from 'components/ui/icons.scss';
import { Panel, PanelBody, PanelFooter, PanelBodyHeader } from 'components/ui/Panel';
import { Input, Checkbox } from 'components/ui/Form';

import styles from './password.scss';
import {helpLinks as helpLinksStyles} from './helpLinks.scss';
import messages from './Password.messages';

export default class Password extends Component {
    displayName = 'Password';

    render() {
        return (
            <div>
                <Message {...messages.passwordTitle}>
                    {(msg) => <Helmet title={msg} />}
                </Message>

                <Panel icon="arrowLeft" title={<Message {...messages.passwordTitle} />}>
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
                                {/* На деле тут может быть и ник, в зависимости от того, что введут в 1 вьюху */}
                                erickskrauch@yandex.ru
                            </div>
                        </div>
                        <Input icon="key" type="password" placeholder={messages.accountPassword} />

                        <Checkbox label={<Message {...messages.rememberMe} />} />
                    </PanelBody>
                    <PanelFooter>
                        <button className={buttons.green}>
                            <Message {...messages.signInButton} />
                        </button>
                    </PanelFooter>
                </Panel>
                <div className={helpLinksStyles}>
                    <a href="#">
                        <Message {...messages.forgotPassword} />
                    </a>
                </div>
            </div>
        );
    }
}
