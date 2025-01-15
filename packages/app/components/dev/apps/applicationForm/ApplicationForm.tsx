import React, { FC, useCallback } from 'react';
import { MessageDescriptor, FormattedMessage as Message, defineMessages } from 'react-intl';
import { Helmet } from 'react-helmet-async';

import { OauthAppResponse } from 'app/services/api/oauth';
import {
    ApplicationType,
    TYPE_WEB_APPLICATION,
    TYPE_DESKTOP_APPLICATION,
    TYPE_MINECRAFT_SERVER,
} from 'app/components/dev/apps';
import { Form, FormModel, Button } from 'app/components/ui/form';
import { BackButton } from 'app/components/profile/ProfileForm';
import { COLOR_GREEN } from 'app/components/ui';
import styles from 'app/components/profile/profileForm.scss';
import logger from 'app/services/logger';

import ApplicationTypeSwitcher from './ApplicationTypeSwitcher';
import WebsiteType from './WebsiteType';
import DesktopApplicationType from './DesktopApplicationType';
import MinecraftServerType from './MinecraftServerType';

const messages = defineMessages({
    website: 'Web site',
    desktopApplication: 'Desktop application',
    minecraftServer: 'Minecraft server',

    creatingApplication: 'Creating an application',
    updatingApplication: 'Updating an application',
});

type TypeToForm = Record<
    ApplicationType,
    {
        label: MessageDescriptor;
        component: React.ComponentType<any>;
    }
>;

const typeToForm: TypeToForm = {
    [TYPE_WEB_APPLICATION]: {
        label: messages.website,
        component: WebsiteType,
    },
    [TYPE_DESKTOP_APPLICATION]: {
        label: messages.desktopApplication,
        component: DesktopApplicationType,
    },
    [TYPE_MINECRAFT_SERVER]: {
        label: messages.minecraftServer,
        component: MinecraftServerType,
    },
};

type TypeToLabel = Record<ApplicationType, MessageDescriptor>;

const typeToLabel: TypeToLabel = (Object.keys(typeToForm) as unknown as Array<ApplicationType>).reduce(
    (result, key) => {
        result[key] = typeToForm[key].label;

        return result;
    },
    {} as TypeToLabel,
);

interface Props {
    app: OauthAppResponse;
    form: FormModel;
    displayTypeSwitcher?: boolean;
    type: ApplicationType | null;
    setType?: (type: ApplicationType) => void;
    onSubmit?: (form: FormModel) => Promise<void>;
}

const ApplicationForm: FC<Props> = ({ app, form, displayTypeSwitcher, type, setType, onSubmit }) => {
    const isUpdate = app.clientId !== '';
    const { component: FormComponent } = (type && typeToForm[type]) || {};

    const onFormSubmit = useCallback(async () => {
        try {
            await onSubmit?.(form);
        } catch (resp) {
            if (resp.errors) {
                form.setErrors(resp.errors);

                return;
            }

            logger.unexpected(new Error('Error submitting application form'), resp);
        }
    }, [form, onSubmit]);

    return (
        <Form form={form} onSubmit={onFormSubmit}>
            <div className={styles.contentWithBackButton}>
                <BackButton to="/dev/applications" />

                <div className={styles.form}>
                    <div className={styles.formBody}>
                        <Message {...(isUpdate ? messages.updatingApplication : messages.creatingApplication)}>
                            {(pageTitle: string) => (
                                <h3 className={styles.title}>
                                    <Helmet title={pageTitle} />
                                    {pageTitle}
                                </h3>
                            )}
                        </Message>

                        {displayTypeSwitcher && (
                            <div className={styles.formRow}>
                                <ApplicationTypeSwitcher selectedType={type} setType={setType} appTypes={typeToLabel} />
                            </div>
                        )}

                        {FormComponent ? (
                            <FormComponent form={form} app={app} />
                        ) : (
                            <div className={styles.formRow}>
                                <p className={styles.description}>
                                    <Message
                                        key="toDisplayRegistrationFormChooseType"
                                        defaultMessage="To display registration form for a new application choose necessary type."
                                    />
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {!!FormComponent && (
                    <Button color={COLOR_GREEN} block type="submit">
                        {isUpdate ? (
                            <Message key="updateApplication" defaultMessage="Update application" />
                        ) : (
                            <Message key="createApplication" defaultMessage="Create application" />
                        )}
                    </Button>
                )}
            </div>
        </Form>
    );
};

export default ApplicationForm;
