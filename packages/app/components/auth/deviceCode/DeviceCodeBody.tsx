import React from 'react';
import { defineMessages } from 'react-intl';

import { Input } from 'app/components/ui/form';
import BaseAuthBody from 'app/components/auth/BaseAuthBody';

const messages = defineMessages({
    deviceCode: 'Device code',
});

export default class DeviceCodeBody extends BaseAuthBody {
    static displayName = 'DeviceCodeBody';
    static panelId = 'deviceCode';

    autoFocusField = 'user_code';

    render() {
        return (
            <div>
                {this.renderErrors()}

                <Input
                    {...this.bindField('user_code')}
                    icon="key"
                    required
                    placeholder={messages.deviceCode}
                />
            </div>
        );
    }
}
