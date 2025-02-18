import React, { ComponentType } from 'react';
import { defineMessages, FormattedMessage as Message } from 'react-intl';
import { Input, TextArea, FormModel } from 'app/components/ui/form';
import { OauthWebAppResponse } from 'app/services/api/oauth';
import { SKIN_LIGHT } from 'app/components/ui';
import styles from 'app/components/profile/profileForm.scss';

import commonMessages from './commonMessages';

const messages = defineMessages({
    redirectUriLimitsAllowableBaseAddress:
        "Redirection URI (redirectUri) determines a base address, that user will be allowed to be redirected to after authorization. In order to improve security it's better to use the whole path instead of just a domain name. For example: https://example.com/oauth/ely.",
    redirectUri: 'Redirect URI:',
});

interface Props {
    form: FormModel;
    app: OauthWebAppResponse;
}

const WebsiteType: ComponentType<Props> = ({ form, app }) => (
    <div>
        <div className={styles.formRow}>
            <Input
                {...form.bindField('name')}
                label={commonMessages.applicationName}
                defaultValue={app.name}
                required
                skin={SKIN_LIGHT}
            />
        </div>

        <div className={styles.formRow}>
            <p className={styles.description}>
                <Message {...commonMessages.appDescriptionWillBeAlsoVisibleOnOauthPage} />
            </p>
        </div>
        <div className={styles.formRow}>
            <TextArea
                {...form.bindField('description')}
                label={commonMessages.description}
                defaultValue={app.description}
                skin={SKIN_LIGHT}
                minRows={3}
            />
        </div>

        <div className={styles.formRow}>
            <p className={styles.description}>
                <Message {...commonMessages.websiteLinkWillBeUsedAsAdditionalId} />
            </p>
        </div>
        <div className={styles.formRow}>
            <Input
                {...form.bindField('websiteUrl')}
                label={commonMessages.websiteLink}
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
            <Input
                {...form.bindField('redirectUri')}
                label={messages.redirectUri}
                defaultValue={app.redirectUri}
                required
                skin={SKIN_LIGHT}
            />
        </div>
    </div>
);

export default WebsiteType;
