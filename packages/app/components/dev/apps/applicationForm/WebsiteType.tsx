import React, { ComponentType } from 'react';
import { FormattedMessage as Message } from 'react-intl';
import { Input, TextArea, FormModel } from 'app/components/ui/form';
import { OauthAppResponse } from 'app/services/api/oauth';
import { SKIN_LIGHT } from 'app/components/ui';
import styles from 'app/components/profile/profileForm.scss';

import messages from './ApplicationForm.intl.json';

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
