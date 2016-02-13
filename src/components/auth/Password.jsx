import React, { PropTypes } from 'react';

import { FormattedMessage as Message } from 'react-intl';
import Helmet from 'react-helmet';

import buttons from 'components/ui/buttons.scss';
import icons from 'components/ui/icons.scss';
import { Input, Checkbox } from 'components/ui/Form';

import BaseAuthBody from './BaseAuthBody';
import styles from './password.scss';
import messages from './Password.messages';

class Body extends BaseAuthBody {
    static propTypes = {
        ...BaseAuthBody.propTypes,
        login: PropTypes.func.isRequired,
        logout: PropTypes.func.isRequired,
        auth: PropTypes.shape({
            error: PropTypes.string,
            login: PropTypes.shape({
                login: PropTypes.stirng,
                password: PropTypes.stirng
            })
        })
    };

    render() {
        const {user} = this.props;

        return (
            <div>
                {this.renderErrors()}

                <div className={styles.miniProfile}>
                    <div className={styles.avatar}>
                        {user.avatar
                            ? <img src={user.avatar} />
                            : <span className={icons.user} />
                        }
                    </div>
                    <div className={styles.email}>
                        {user.email || user.username}
                    </div>
                </div>
                <Input {...this.bindField('password')}
                    icon="key"
                    type="password"
                    autoFocus
                    required
                    placeholder={messages.accountPassword}
                />

                <Checkbox {...this.bindField('rememberMe')} label={<Message {...messages.rememberMe} />} />
            </div>
        );
    }

    onFormSubmit() {
        this.props.login({
            ...this.serialize(),
            login: this.props.user.email || this.props.user.username
        });
    }

    onGoBack() {
        this.props.logout();
    }
}

export default function Password() {
    var Title = () => ( // TODO: separate component for PageTitle
        <Message {...messages.passwordTitle}>
            {(msg) => <span>{msg}<Helmet title={msg} /></span>}
        </Message>
    );
    Title.goBack = true;

    return {
        Title,
        Body,
        Footer: () => (
            <button className={buttons.green} type="submit">
                <Message {...messages.signInButton} />
            </button>
        ),
        Links: () => (
            <a href="#">
                <Message {...messages.forgotPassword} />
            </a>
        )
    };
}
