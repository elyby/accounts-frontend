import React, { Component } from 'react';

import { FormattedMessage as Message } from 'react-intl';

import buttons from 'components/ui/buttons.scss';
import icons from 'components/ui/icons.scss';
import { Panel, PanelBody, PanelFooter, PanelBodyHeader } from 'components/ui/Panel';
import { Input, Checkbox } from 'components/ui/Form';

import styles from './signIn.scss';
import messages from './SignIn.messages';

export default class Permissions extends Component {
    displayName = 'Permissions';

    render() {
        return (
            <div className={styles.signIn}>
                <Panel title={<Message {...messages.permissionsTitle} />}>
                    <PanelBody className={styles.authBody}>
                        <PanelBodyHeader className={styles.authBodyHeader}>
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
                            <li>Authorization for Minecraft servers</li>
                            <li>Manage your skins directory and additional rows for multiline</li>
                            <li>Change the active skin</li>
                            <li>View your E-mail address</li>
                        </ul>
                    </PanelBody>
                    <PanelFooter>
                        <button className={buttons.green}>
                            <Message {...messages.approve} />
                        </button>
                    </PanelFooter>
                </Panel>
                <div className={styles.helpLinks}>
                    <a href="#">
                        <Message {...messages.decline} />
                    </a>
                </div>
            </div>
        );
    }
}
