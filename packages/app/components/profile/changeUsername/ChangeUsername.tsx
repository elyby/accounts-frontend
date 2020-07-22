import React from 'react';
import { FormattedMessage as Message } from 'react-intl';
import { Helmet } from 'react-helmet-async';
import { Input, Button, Form, FormModel } from 'app/components/ui/form';
import { BackButton } from 'app/components/profile/ProfileForm';

import styles from '../profileForm.scss';

interface Props {
    username: string;
    form: FormModel;
    onChange: (name: string) => void;
    onSubmit: (form: FormModel) => Promise<void>;
}

export default class ChangeUsername extends React.Component<Props> {
    static get defaultProps(): Partial<Props> {
        return {
            form: new FormModel(),
        };
    }

    render() {
        const { form, username } = this.props;

        return (
            <Form onSubmit={this.onFormSubmit} form={form}>
                <div className={styles.contentWithBackButton}>
                    <BackButton />

                    <div className={styles.form}>
                        <div className={styles.formBody}>
                            <Message key="changeUsernameTitle" defaultMessage="Change nickname">
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
                                        key="changeUsernameDescription"
                                        defaultMessage="You can change your nickname to any arbitrary value. Remember that it is not recommended to take a nickname of already existing Mojang account."
                                    />
                                </p>
                            </div>

                            <div className={styles.formRow}>
                                <Input
                                    {...form.bindField('username')}
                                    defaultValue={username}
                                    onChange={this.onUsernameChange}
                                    required
                                    skin="light"
                                />
                            </div>

                            <div className={styles.formRow}>
                                <p className={styles.description}>
                                    <Message
                                        key="changeUsernameWarning"
                                        defaultMessage="Be careful: if you playing on the server with nickname binding, then after changing nickname you may lose all your progress."
                                    />
                                </p>
                            </div>
                        </div>

                        <Button color="green" block type="submit">
                            <Message key="changeUsernameButton" defaultMessage="Change nickname" />
                        </Button>
                    </div>
                </div>
            </Form>
        );
    }

    onUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.props.onChange(event.target.value);
    };

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
