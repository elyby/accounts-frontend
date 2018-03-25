// @flow
import React, { Component } from 'react';
import { FormattedMessage as Message } from 'react-intl';

import styles from 'components/profile/profileForm.scss';
import messages from './ApplicationForm.intl.json';

import { Input, TextArea, FormModel } from 'components/ui/form';
import { SKIN_LIGHT } from 'components/ui';

import type { OauthAppResponse } from 'services/api/oauth';

export default class WebsiteType extends Component<{
    form: FormModel,
    app: OauthAppResponse,
}> {
    render() {
        const { form, app } = this.props;

        return (
            <div>
                <div className={styles.formRow}>
                    <Input {...form.bindField('name')}
                        label={messages.applicationName}
                        defaultValue={app.name}
                        required
                        skin={SKIN_LIGHT}
                    />
                </div>

                <div className={styles.formRow}>
                    <p className={styles.description}>
                        <Message {...messages.appDescriptionWillBeAlsoVisibleOnOauthPage} />
                    </p>
                </div>
                <div className={styles.formRow}>
                    <TextArea {...form.bindField('description')}
                        label={messages.description}
                        defaultValue={app.description}
                        skin={SKIN_LIGHT}
                        minRows={3}
                    />
                </div>

                <div className={styles.formRow}>
                    <p className={styles.description}>
                        <Message {...messages.websiteLinkWillBeUsedAsAdditionalId} />
                    </p>
                </div>
                <div className={styles.formRow}>
                    <Input {...form.bindField('websiteUrl')}
                        label={messages.websiteLink}
                        defaultValue={app.websiteUrl}
                        skin={SKIN_LIGHT}
                    />
                </div>

                <div className={styles.formRow}>
                    <p className={styles.description}>
                        <Message {...messages.redirectUriLimitsAllowableBaseAddress} />
                    </p>
                </div>
                <div className={styles.formRow}>
                    <Input {...form.bindField('redirectUri')}
                        label={messages.redirectUri}
                        defaultValue={app.redirectUri}
                        required
                        skin={SKIN_LIGHT}
                    />
                </div>
            </div>
        );
    }
}
