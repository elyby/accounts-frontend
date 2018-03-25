// @flow
import React, { Component } from 'react';
import { FormattedMessage as Message } from 'react-intl';

import styles from 'components/profile/profileForm.scss';
import messages from './ApplicationForm.intl.json';

import { Input, FormModel } from 'components/ui/form';
import { SKIN_LIGHT } from 'components/ui';

import type {OauthAppResponse} from 'services/api/oauth';

export default class MinecraftServerType extends Component<{
    form: FormModel,
    app: OauthAppResponse,
}> {
    render() {
        const { form, app } = this.props;

        return (
            <div>
                <div className={styles.formRow}>
                    <Input {...form.bindField('name')}
                        label={messages.serverName}
                        defaultValue={app.name}
                        required
                        skin={SKIN_LIGHT}
                    />
                </div>

                <div className={styles.formRow}>
                    <p className={styles.description}>
                        <Message {...messages.ipAddressIsOptionButPreferable} />
                    </p>
                </div>
                <div className={styles.formRow}>
                    <Input {...form.bindField('minecraftServerIp')}
                        label={messages.serverIp}
                        defaultValue={app.minecraftServerIp}
                        skin={SKIN_LIGHT}
                    />
                </div>

                <div className={styles.formRow}>
                    <p className={styles.description}>
                        <Message {...messages.youCanAlsoSpecifyServerSite} />
                    </p>
                </div>
                <div className={styles.formRow}>
                    <Input {...form.bindField('websiteUrl')}
                        label={messages.websiteLink}
                        defaultValue={app.websiteUrl}
                        skin={SKIN_LIGHT}
                    />
                </div>
            </div>
        );
    }
}
