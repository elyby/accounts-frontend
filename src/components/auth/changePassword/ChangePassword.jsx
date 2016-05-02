import React, { PropTypes } from 'react';

import { FormattedMessage as Message } from 'react-intl';
import Helmet from 'react-helmet';

import buttons from 'components/ui/buttons.scss';
import { Input } from 'components/ui/form';
import BaseAuthBody from 'components/auth/BaseAuthBody';
import icons from 'components/ui/icons.scss';

import messages from './ChangePassword.messages';
import styles from './changePassword.scss';

class Body extends BaseAuthBody {
    static displayName = 'ChangePasswordBody';
    static panelId = 'changePassword';

    autoFocusField = 'password';

    render() {
        return (
            <div>
                {this.renderErrors()}

                <div className={styles.security}>
                    <span className={icons.lock} />
                </div>

                <p className={styles.descriptionText}>
                    <Message {...messages.changePasswordMessage} />
                </p>

                <Input {...this.bindField('password')}
                    icon="key"
                    color="darkBlue"
                    type="password"
                    required
                    placeholder={messages.currentPassword}
                />

                <Input {...this.bindField('newPassword')}
                    icon="key"
                    color="darkBlue"
                    type="password"
                    required
                    placeholder={messages.newPassword}
                />

                <Input {...this.bindField('newRePassword')}
                    icon="key"
                    color="darkBlue"
                    type="password"
                    required
                    placeholder={messages.newRePassword}
                />
            </div>
        );
    }
}

export default function ChangePassword() {
    const componentsMap = {
        Title: () => ( // TODO: separate component for PageTitle
            <Message {...messages.changePasswordTitle}>
                {(msg) => <span>{msg}<Helmet title={msg} /></span>}
            </Message>
        ),
        Body,
        Footer: () => (
            <button className={buttons.darkBlue} type="submit">
                <Message {...messages.change} />
            </button>
        ),
        Links: (props, context) => (
            <a href="#" onClick={(event) => {
                event.preventDefault();

                context.reject();
            }}>
                <Message {...messages.skipThisStep} />
            </a>
        )
    };

    componentsMap.Links.contextTypes = {
        reject: PropTypes.func.isRequired
    };

    return componentsMap;
}
