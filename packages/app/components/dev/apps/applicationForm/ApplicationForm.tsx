import React from 'react';
import { FormattedMessage as Message } from 'react-intl';
import { Helmet } from 'react-helmet-async';
import { MessageDescriptor } from 'react-intl';
import { OauthAppResponse } from 'app/services/api/oauth';
import { ApplicationType } from 'app/components/dev/apps';
import { Form, FormModel, Button } from 'app/components/ui/form';
import { BackButton } from 'app/components/profile/ProfileForm';
import { COLOR_GREEN } from 'app/components/ui';
import { TYPE_APPLICATION, TYPE_MINECRAFT_SERVER } from 'app/components/dev/apps';
import styles from 'app/components/profile/profileForm.scss';
import logger from 'app/services/logger';
import messages from './ApplicationForm.intl.json';

import ApplicationTypeSwitcher from './ApplicationTypeSwitcher';
import WebsiteType from './WebsiteType';
import MinecraftServerType from './MinecraftServerType';

type TypeToForm = Record<
    ApplicationType,
    {
        label: MessageDescriptor;
        component: React.ComponentType<any>;
    }
>;

const typeToForm: TypeToForm = {
    [TYPE_APPLICATION]: {
        label: messages.website,
        component: WebsiteType,
    },
    [TYPE_MINECRAFT_SERVER]: {
        label: messages.minecraftServer,
        component: MinecraftServerType,
    },
};

type TypeToLabel = Record<ApplicationType, MessageDescriptor>;

const typeToLabel: TypeToLabel = ((Object.keys(typeToForm) as unknown) as Array<ApplicationType>).reduce(
    (result, key) => {
        result[key] = typeToForm[key].label;

        return result;
    },
    {} as TypeToLabel,
);

export default class ApplicationForm extends React.Component<{
    app: OauthAppResponse;
    form: FormModel;
    displayTypeSwitcher?: boolean;
    type: ApplicationType | null;
    setType: (type: ApplicationType) => void;
    onSubmit: (form: FormModel) => Promise<void>;
}> {
    static defaultProps = {
        setType: () => {},
    };

    render() {
        const { type, setType, form, displayTypeSwitcher, app } = this.props;
        const { component: FormComponent } = (type && typeToForm[type]) || {};
        const isUpdate = app.clientId !== '';

        return (
            <Form form={form} onSubmit={this.onFormSubmit}>
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
                                    <ApplicationTypeSwitcher
                                        selectedType={type}
                                        setType={setType}
                                        appTypes={typeToLabel}
                                    />
                                </div>
                            )}

                            {FormComponent ? (
                                <FormComponent form={form} app={app} />
                            ) : (
                                <div className={styles.formRow}>
                                    <p className={styles.description}>
                                        <Message {...messages.toDisplayRegistrationFormChooseType} />
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {!!FormComponent && (
                        <Button
                            color={COLOR_GREEN}
                            block
                            label={isUpdate ? messages.updateApplication : messages.createApplication}
                            type="submit"
                        />
                    )}
                </div>
            </Form>
        );
    }

    onFormSubmit = async () => {
        const { form } = this.props;

        try {
            await this.props.onSubmit(form);
        } catch (resp) {
            if (resp.errors) {
                form.setErrors(resp.errors);

                return;
            }

            logger.unexpected(new Error('Error submitting application form'), resp);
        }
    };
}
