import React from 'react';
import { FormattedMessage as Message } from 'react-intl';
import { OauthAppResponse } from 'app/services/api/oauth';
import { Input, FormModel } from 'app/components/ui/form';
import { SKIN_LIGHT } from 'app/components/ui';
import styles from 'app/components/profile/profileForm.scss';

import messages from './ApplicationForm.intl.json';

export default function MinecraftServerType({
  form,
  app,
}: {
  form: FormModel;
  app: OauthAppResponse;
}) {
  return (
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
}
