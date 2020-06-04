import React, { ComponentType } from 'react';
import { FormattedMessage as Message, defineMessages } from 'react-intl';
import { OauthAppResponse } from 'app/services/api/oauth';
import { Input, FormModel } from 'app/components/ui/form';
import { SKIN_LIGHT } from 'app/components/ui';
import styles from 'app/components/profile/profileForm.scss';

const messages = defineMessages({
    serverName: 'Server name:',
    ipAddressIsOptionButPreferable:
        'IP address is optional, but is very preferable. It might become handy in case of we suddenly decide to play on your server with the entire band (=',
    serverIp: 'Server IP:',
    youCanAlsoSpecifyServerSite: "You also can specify either server's site URL or its community in a social network.",
    websiteLink: 'Website link:',
});

interface Props {
    form: FormModel;
    app: OauthAppResponse;
}

const MinecraftServerType: ComponentType<Props> = ({ form, app }) => (
    <div>
        <div className={styles.formRow}>
            <Input
                {...form.bindField('name')}
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
            <Input
                {...form.bindField('minecraftServerIp')}
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
            <Input
                {...form.bindField('websiteUrl')}
                label={messages.websiteLink}
                defaultValue={app.websiteUrl}
                skin={SKIN_LIGHT}
            />
        </div>
    </div>
);

export default MinecraftServerType;
