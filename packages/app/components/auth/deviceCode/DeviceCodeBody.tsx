import React from 'react';
import { FormattedMessage as Message } from 'react-intl';

import { Input } from 'app/components/ui/form';
import BaseAuthBody from 'app/components/auth/BaseAuthBody';

export default class DeviceCodeBody extends BaseAuthBody {
    static displayName = 'DeviceCodeBody';
    static panelId = 'deviceCode';

    autoFocusField = 'user_code';

    render() {
        return (
            <>
                {this.renderErrors()}

                <Message id="deviceCode" defaultMessage="Device Code">
                    {(nodes) => (
                        <Input
                            {...this.bindField('user_code')}
                            icon="key"
                            name="user_cide"
                            autoFocus
                            required
                            placeholder={nodes as string}
                        />
                    )}
                </Message>
            </>
        );
    }
}
