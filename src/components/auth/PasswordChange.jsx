import React, { PropTypes } from 'react';

import { FormattedMessage as Message } from 'react-intl';
import Helmet from 'react-helmet';
import { Link } from 'react-router';

import buttons from 'components/ui/buttons.scss';
import { Input } from 'components/ui/Form';

import BaseAuthBody from './BaseAuthBody';
import passwordChangedMessages from './PasswordChange.messages';

import icons from 'components/ui/icons.scss';
import styles from './passwordChange.scss';

class Body extends BaseAuthBody {
    static propTypes = {
        ...BaseAuthBody.propTypes
    };

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
    return {
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
        Links: (props) => (
            <a href="#" onClick={(event) => {
                event.preventDefault();

                props.reject();
            }}>
                <Message {...passwordChangedMessages.skipThisStep} />
            </a>
        )
    };
}
