import React, { FC } from 'react';
import { FormattedMessage as Message } from 'react-intl';

import { Input, TextArea, FormModel } from 'app/components/ui/form';
import { OauthDesktopAppResponse } from 'app/services/api/oauth';
import { SKIN_LIGHT } from 'app/components/ui';
import styles from 'app/components/profile/profileForm.scss';

import commonMessages from './commonMessages';

interface Props {
    form: FormModel;
    app: OauthDesktopAppResponse;
}

const DesktopApplicationType: FC<Props> = ({ form, app }) => (
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
    </div>
);

export default DesktopApplicationType;
