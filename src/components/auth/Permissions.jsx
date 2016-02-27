import React, { PropTypes } from 'react';

import { FormattedMessage as Message } from 'react-intl';
import Helmet from 'react-helmet';

import buttons from 'components/ui/buttons.scss';
import icons from 'components/ui/icons.scss';
import { PanelBodyHeader } from 'components/ui/Panel';

import BaseAuthBody from './BaseAuthBody';
import styles from './permissions.scss';
import messages from './Permissions.messages';

class Body extends BaseAuthBody {
    static propTypes = {
        ...BaseAuthBody.propTypes,
        login: PropTypes.func.isRequired,
        oAuthComplete: PropTypes.func.isRequired,
        auth: PropTypes.shape({
            error: PropTypes.string,
            login: PropTypes.shape({
                login: PropTypes.stirng
            })
        })
    };

    render() {
        const {user} = this.props;

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
                        <li>Authorization for Minecraft servers</li>
                        <li>Manage your skins directory and additional rows for multiline</li>
                        <li>Change the active skin</li>
                        <li>View your E-mail address</li>
                    </ul>
                </div>
            </div>
        );
    }

    onFormSubmit() {
        this.props.oAuthComplete({
            accept: true
        });
    }
}

export default function Permissions() {
    return {
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
        Links: () => (
            <a href="#">
                <Message {...messages.decline} />
            </a>
        )
    };
}
