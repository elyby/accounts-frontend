// @flow
import React, { Component } from 'react';
import { FormattedMessage as Message } from 'react-intl';
import { Helmet } from 'react-helmet';

import { Form, FormModel, Button } from 'components/ui/form';
import { BackButton } from 'components/profile/ProfileForm';
import { COLOR_GREEN } from 'components/ui';

import { TYPE_APPLICATION, TYPE_MINECRAFT_SERVER } from 'components/dev/apps';
import styles from 'components/profile/profileForm.scss';
import messages from './ApplicationForm.intl.json';

import ApplicationTypeSwitcher from './ApplicationTypeSwitcher';
import WebsiteType from './WebsiteType';
import MinecraftServerType from './MinecraftServerType';

import type { ComponentType } from 'react';
import type { MessageDescriptor } from 'react-intl';
import type { OauthAppResponse } from 'services/api/oauth';

const typeToForm: {
    [key: string]: {
        label: MessageDescriptor,
        component: ComponentType<any>,
    },
} = {
    [TYPE_APPLICATION]: {
        label: messages.website,
        component: WebsiteType,
    },
    [TYPE_MINECRAFT_SERVER]: {
        label: messages.minecraftServer,
        component: MinecraftServerType,
    },
};

const typeToLabel: {
    [key: string]: MessageDescriptor,
} = Object.keys(typeToForm).reduce((result, key: string) => {
    result[key] = typeToForm[key].label;
    return result;
}, {});

export default class ApplicationForm extends Component<{
    app: OauthAppResponse,
    form: FormModel,
    displayTypeSwitcher?: bool,
    type: ?string,
    setType: (string) => void,
    onSubmit: (FormModel) => Promise<*>,
}> {
    static displayName = 'ApplicationForm';

    static defaultProps = {
        setType: () => {},
    };

    render() {
        const { type, setType, form, displayTypeSwitcher, app } = this.props;
        const { component: FormComponent } = type && typeToForm[type] || {};
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

                            {!FormComponent && (
                                <div className={styles.formRow}>
                                    <p className={styles.description}>
                                        <Message {...messages.toDisplayRegistrationFormChooseType} />
                                    </p>
                                </div>
                            )}

                            {FormComponent && <FormComponent form={form} app={app} />}
                        </div>
                    </div>

                    {FormComponent && (
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

            throw resp;
        }
    };
}
