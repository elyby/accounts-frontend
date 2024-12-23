import React from 'react';
import { FormattedMessage as Message } from 'react-intl';

import { Input } from 'app/components/ui/form';
import BaseAuthBody from 'app/components/auth/BaseAuthBody';

import style from './deviceCode.scss';

export default class DeviceCodeBody extends BaseAuthBody {
    static displayName = 'DeviceCodeBody';
    static panelId = 'deviceCode';

    autoFocusField = 'user_code';

    render() {
        return (
            <>
                {this.renderErrors()}

                <div className={style.icon} />

                <div className={style.description}>
                    <Message
                        id="deviceCodeDescription"
                        defaultMessage="To authorize the application, enter the code displayed on the screen."
                    />
                </div>

                <Message id="enterDeviceCode" defaultMessage="Enter Device Code">
                    {(nodes) => (
                        <Input
                            {...this.bindField('user_code')}
                            autoFocus
                            center
                            required
                            placeholder={nodes as string}
                        />
                    )}
                </Message>
            </>
        );
    }
}
