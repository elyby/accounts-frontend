import React, { ComponentType } from 'react';
import { defineMessages, FormattedMessage as Message } from 'react-intl';
import { Input, TextArea, FormModel } from 'app/components/ui/form';
import { OauthAppResponse } from 'app/services/api/oauth';
import { SKIN_LIGHT } from 'app/components/ui';
import styles from 'app/components/profile/profileForm.scss';

const messages = defineMessages({
    applicationName: 'Application name:',
    appDescriptionWillBeAlsoVisibleOnOauthPage:
        "Application's description will be displayed at the authorization page too. It isn't a required field. In authorization process the value may be overridden.",
    description: 'Description:',
    websiteLinkWillBeUsedAsAdditionalId:
        "Site's link is optional, but it can be used as an additional identifier of the application.",
    websiteLink: 'Website link:',
    redirectUriLimitsAllowableBaseAddress:
        "Redirection URI (redirectUri) determines a base address, that user will be allowed to be redirected to after authorization. In order to improve security it's better to use the whole path instead of just a domain name. For example: https://example.com/oauth/ely.",
    redirectUri: 'Redirect URI:',
});

interface Props {
    form: FormModel;
    app: OauthAppResponse;
}

const WebsiteType: ComponentType<Props> = ({ form, app }) => (
    <div>
        <div className={styles.formRow}>
            <Input
                {...form.bindField('name')}
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
            <TextArea
                {...form.bindField('description')}
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
            <Input
                {...form.bindField('websiteUrl')}
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
