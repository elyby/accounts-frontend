import React, { FC } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { FormattedMessage as Message, defineMessages } from 'react-intl';

import { Button } from 'app/components/ui/form';
import AuthTitle from 'app/components/auth/AuthTitle';
import PanelTransition from 'app/components/auth/PanelTransition';

import style from './deviceCode.scss';
import DeviceCodeBody from './DeviceCodeBody';

const messages = defineMessages({
    deviceCodeTitle: 'Device Code',
});

const DeviceCode: FC<RouteComponentProps> = (props) => {
    return (
        <PanelTransition
            key="deviceCode"
            className={style.form}
            Title={<AuthTitle title={messages.deviceCodeTitle} />}
            Body={<DeviceCodeBody {...props} />}
            Footer={
                <Button type="submit">
                    <Message id="continue" defaultMessage="Continue" />
                </Button>
            }
        />
    );
};

export default DeviceCode;
