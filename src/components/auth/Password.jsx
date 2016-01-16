import React, { Component } from 'react';

import { FormattedMessage as Message } from 'react-intl';

import buttons from 'components/ui/buttons.scss';
import icons from 'components/ui/icons.scss';
import { Panel, PanelBody, PanelFooter, PanelBodyHeader } from 'components/ui/Panel';
import { Input, Checkbox } from 'components/ui/Form';

import styles from './signIn.scss';
import messages from './SignIn.messages';

export default class Password extends Component {
    displayName = 'Password';

    render() {
        return (
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
                                {/* На деле тут может быть и ник, в зависимости от того, что введут в 1 вьюху */}
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
                </div>
            </div>
        );
    }
}
