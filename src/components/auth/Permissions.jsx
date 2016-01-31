import React, { Component } from 'react';

import { FormattedMessage as Message } from 'react-intl';
import Helmet from 'react-helmet';

import buttons from 'components/ui/buttons.scss';
import icons from 'components/ui/icons.scss';
import { Panel, PanelBody, PanelFooter, PanelBodyHeader } from 'components/ui/Panel';

import styles from './permissions.scss';
import {helpLinks as helpLinksStyles} from './helpLinks.scss';
import messages from './Permissions.messages';

export default function Permissions() {
    return {
        Title: () => ( // TODO: separate component for PageTitle
            <Message {...messages.permissionsTitle}>
                {(msg) => <span>{msg}<Helmet title={msg} /></span>}
            </Message>
        ),
        Body: () => (
            <div>
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
                <div className={styles.permissionsContainer}>
                    <div className={styles.permissionsTitle}>
                        <Message {...messages.theAppNeedsAccess} />
                    </div>
                    <ul className={styles.permissionsList}>
                        <li>Authorization for Minecraft servers</li>
                        <li>Manage your skins directory and additional rows for multiline</li>
                        <li>Change the active skin</li>
                        <li>View your E-mail address</li>
                    </ul>
                </div>
            </div>
        ),
        Footer: () => (
            <button className={buttons.green}>
                <Message {...messages.approve} />
            </button>
        ),
        Links: () => (
            <a href="#">
                <Message {...messages.decline} />
            </a>
        )
    };
}

export class _Permissions extends Component {
    displayName = 'Permissions';

    render() {
        return (
            <div>
                <Message {...messages.permissionsTitle}>
                    {(msg) => <Helmet title={msg} />}
                </Message>

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
                        <div className={styles.permissionsContainer}>
                            <div className={styles.permissionsTitle}>
                                <Message {...messages.theAppNeedsAccess} />
                            </div>
                            <ul className={styles.permissionsList}>
                                <li>Authorization for Minecraft servers</li>
                                <li>Manage your skins directory and additional rows for multiline</li>
                                <li>Change the active skin</li>
                                <li>View your E-mail address</li>
                            </ul>
                        </div>
                    </PanelBody>
                    <PanelFooter>
                        <button className={buttons.green}>
                            <Message {...messages.approve} />
                        </button>
                    </PanelFooter>
                </Panel>
                <div className={helpLinksStyles}>
                    <a href="#">
                        <Message {...messages.decline} />
                    </a>
                </div>
            </div>
        );
    }
}
