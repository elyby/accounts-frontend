import React, { PropTypes } from 'react';

import { FormattedMessage as Message } from 'react-intl';

import { Input } from 'components/ui/form';
import BaseAuthBody from 'components/auth/BaseAuthBody';
import changePassword from 'components/auth/changePassword/ChangePassword.intl.json';

import styles from './recoverPassword.scss';
import messages from './RecoverPassword.intl.json';

// TODO: activation code field may be decoupled into common component and reused here and in activation panel
// TODO: new password fields may be decoupled into common component and reused here and in changePassword panel

export default class RecoverPasswordBody extends BaseAuthBody {
    static displayName = 'RecoverPasswordBody';
    static panelId = 'recoverPassword';
    static hasGoBack = true;

    static propTypes = {
        params: PropTypes.shape({
            key: PropTypes.string
        })
    };

    autoFocusField = this.props.params && this.props.params.key ? 'newPassword' : 'key';

    render() {
        const {user} = this.context;
        const {key} = this.props.params;

        return (
            <div>
                {this.renderErrors()}

                <p className={styles.descriptionText}>
                    {user.maskedEmail ? (
                        <Message {...messages.messageWasSentTo} values={{
                            email: <b>{user.maskedEmail}</b>
                        }} />
                    ) : (
                        <Message {...messages.messageWasSent} />
                    )}
                    {' '}
                    <Message {...messages.enterCodeBelow} />
                </p>

                <Input {...this.bindField('key')}
                    color="lightViolet"
                    style={{textAlign: 'center'}} // ну это уже низко
                    required
                    value={key}
                    readOnly={!!key}
                    placeholder={messages.enterTheCode}
                />

                <p className={styles.descriptionText}>
                    <Message {...messages.enterNewPasswordBelow} />
                </p>

                <Input {...this.bindField('newPassword')}
                    icon="key"
                    color="lightViolet"
                    type="password"
                    required
                    placeholder={changePassword.newPassword}
                />

                <Input {...this.bindField('newRePassword')}
                    icon="key"
                    color="lightViolet"
                    type="password"
                    required
                    placeholder={changePassword.newRePassword}
                />
            </div>
        );
    }
}
