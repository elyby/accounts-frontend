import React from 'react';
import { defineMessages, FormattedMessage as Message } from 'react-intl';
import { Helmet } from 'react-helmet-async';
import { Input, Button, Checkbox, Form, FormModel } from 'app/components/ui/form';

import { BackButton } from '../ProfileForm';
import styles from '../profileForm.scss';

const labels = defineMessages({
    newPasswordLabel: 'New password:',
    repeatNewPasswordLabel: 'Repeat the password:',
    logoutOnAllDevices: 'Logout on all devices',
});

interface Props {
    form: FormModel;
    onSubmit: (form: FormModel) => Promise<void>;
}

export default class ChangePassword extends React.Component<Props> {
    static get defaultProps(): Partial<Props> {
        return {
            form: new FormModel(),
        };
    }

    render() {
        const { form } = this.props;

        return (
            <Form onSubmit={this.onFormSubmit} form={form}>
                <div className={styles.contentWithBackButton}>
                    <BackButton />

                    <div className={styles.form}>
                        <div className={styles.formBody}>
                            <Message key="changePasswordTitle" defaultMessage="Change password">
                                {(pageTitle) => (
                                    <h3 className={styles.title}>
                                        <Helmet title={pageTitle as string} />
                                        {pageTitle}
                                    </h3>
                                )}
                            </Message>

                            <div className={styles.formRow}>
                                <p className={styles.description}>
                                    <Message
                                        key="changePasswordDescription"
                                        defaultMessage="Please take a password, that will be different from your passwords on the other sites and will not be the same you are using to enter Minecraft game servers you are playing."
                                    />
                                    <br />
                                    <b>
                                        <Message
                                            key="achievementLossWarning"
                                            defaultMessage="Are you cherish your game achievements, right?"
                                        />
                                    </b>
                                </p>
                            </div>

                            <div className={styles.formRow}>
                                <Input
                                    {...form.bindField('newPassword')}
                                    type="password"
                                    required
                                    skin="light"
                                    label={labels.newPasswordLabel}
                                />
                            </div>

                            <div className={styles.formRow}>
                                <p className={styles.description}>
                                    <Message
                                        key="passwordRequirements"
                                        defaultMessage="Password must contain at least 8 characters. It can be any symbols — do not limit yourself, create an unpredictable password!"
                                    />
                                </p>
                            </div>

                            <div className={styles.formRow}>
                                <Input
                                    {...form.bindField('newRePassword')}
                                    type="password"
                                    required
                                    skin="light"
                                    label={labels.repeatNewPasswordLabel}
                                />
                            </div>

                            <div className={styles.formRow}>
                                <Checkbox
                                    {...form.bindField('logoutAll')}
                                    defaultChecked
                                    skin="light"
                                    label={labels.logoutOnAllDevices}
                                />
                            </div>
                        </div>

                        <Button color="green" block type="submit">
                            <Message key="changePasswordButton" defaultMessage="Change password" />
                        </Button>
                    </div>
                </div>
            </Form>
        );
    }

    onFormSubmit = () => {
        const { form } = this.props;

        this.props.onSubmit(form).catch((resp) => {
            if (resp.errors) {
                form.setErrors(resp.errors);
            } else {
                return Promise.reject(resp);
            }
        });
    };
}
