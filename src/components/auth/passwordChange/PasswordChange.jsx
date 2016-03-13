import React, { PropTypes } from 'react';

import { FormattedMessage as Message } from 'react-intl';
import Helmet from 'react-helmet';

import buttons from 'components/ui/buttons.scss';
import { Input } from 'components/ui/Form';

import BaseAuthBody from 'components/auth/BaseAuthBody';
import passwordChangedMessages from './PasswordChange.messages';

import icons from 'components/ui/icons.scss';
import styles from './passwordChange.scss';

class Body extends BaseAuthBody {
    static displayName = 'PasswordChangeBody';

    render() {
        return (
            <div>
                {this.renderErrors()}

                <div className={styles.security}>
                    <span className={icons.lock} />
                </div>

                <p className={styles.descriptionText}>
                    <Message {...passwordChangedMessages.changePasswordMessage} />
                </p>

                <Input {...this.bindField('newPassword')}
                    icon="key"
                    color="darkBlue"
                    autoFocus
                    onFocus={this.fixAutoFocus}
                    required
                    placeholder={passwordChangedMessages.newPassword}
                />

                <Input {...this.bindField('newRePassword')}
                    icon="key"
                    color="darkBlue"
                    required
                    placeholder={passwordChangedMessages.newRePassword}
                />
            </div>
        );
    }
}

export default function PasswordChange() {
    const componentsMap = {
        Title: () => ( // TODO: separate component for PageTitle
            <Message {...passwordChangedMessages.changePasswordTitle}>
                {(msg) => <span>{msg}<Helmet title={msg} /></span>}
            </Message>
        ),
        Body,
        Footer: () => (
            <button className={buttons.darkBlue} type="submit">
                <Message {...passwordChangedMessages.change} />
            </button>
        ),
        Links: (props, context) => (
            <a href="#" onClick={(event) => {
                event.preventDefault();

                context.reject();
            }}>
                <Message {...passwordChangedMessages.skipThisStep} />
            </a>
        )
    };

    componentsMap.Links.contextTypes = {
        reject: PropTypes.func.isRequired
    };

    return componentsMap;
}
