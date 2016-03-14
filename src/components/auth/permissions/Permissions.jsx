import React, { PropTypes } from 'react';

import { FormattedMessage as Message } from 'react-intl';
import Helmet from 'react-helmet';

import buttons from 'components/ui/buttons.scss';
import icons from 'components/ui/icons.scss';
import { PanelBodyHeader } from 'components/ui/Panel';

import BaseAuthBody from 'components/auth/BaseAuthBody';
import styles from './permissions.scss';
import messages from './Permissions.messages';

class Body extends BaseAuthBody {
    static displayName = 'PermissionsBody';

    render() {
        const {user} = this.context;
        const scopes = this.context.auth.scopes;

        return (
            <div>
                {this.renderErrors()}

                <PanelBodyHeader>
                    <div className={styles.authInfo}>
                        <div className={styles.authInfoAvatar}>
                            {user.avatar
                                ? <img src={user.avatar} />
                                : <span className={icons.user} />
                            }
                        </div>
                        <div className={styles.authInfoTitle}>
                            <Message {...messages.youAuthorizedAs} />
                        </div>
                        <div className={styles.authInfoEmail}>
                            {user.email}
                        </div>
                    </div>
                </PanelBodyHeader>
                <div className={styles.permissionsContainer}>
                    <div className={styles.permissionsTitle}>
                        <Message {...messages.theAppNeedsAccess1} /><br />
                        <Message {...messages.theAppNeedsAccess2} />
                    </div>
                    <ul className={styles.permissionsList}>
                        {scopes.map((scope, key) => (
                            <li key={key}>{<Message {...messages[`scope_${scope}`]} />}</li>
                        ))}
                    </ul>
                </div>
            </div>
        );
    }
}

export default function Permissions() {
    const componentsMap = {
        Title: () => ( // TODO: separate component for PageTitle
            <Message {...messages.permissionsTitle}>
                {(msg) => <span>{msg}<Helmet title={msg} /></span>}
            </Message>
        ),
        Body,
        Footer: () => (
            <button className={buttons.orange} autoFocus>
                <Message {...messages.approve} />
            </button>
        ),
        Links: (props, context) => (
            <a href="#" onClick={(event) => {
                event.preventDefault();

                context.reject();
            }}>
                <Message {...messages.decline} />
            </a>
        )
    };

    componentsMap.Links.contextTypes = {
        reject: PropTypes.func.isRequired
    };

    return componentsMap;
}
