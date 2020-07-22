import React, { ComponentType, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FormattedMessage as Message, defineMessages } from 'react-intl';

import Popup from 'app/components/ui/popup';
import { Input, TextArea, Button, Form, FormModel, Dropdown } from 'app/components/ui/form';

import styles from './contactForm.scss';

const CONTACT_CATEGORIES = {
    // TODO: сюда позже проставить реальные id категорий с backend
    0: <Message key="cannotAccessMyAccount" defaultMessage="Can not access my account" />,
    1: <Message key="foundBugOnSite" defaultMessage="I found a bug on the site" />,
    2: <Message key="improvementsSuggestion" defaultMessage="I have a suggestion for improving the functional" />,
    3: <Message key="integrationQuestion" defaultMessage="Service integration question" />,
    4: <Message key="other" defaultMessage="Other" />,
};

const labels = defineMessages({
    subject: 'Subject',
    email: 'E‑mail',
    message: 'Message',
    whichQuestion: 'What are you interested in?',
});

interface Props {
    initEmail?: string;
    onSubmit?: (params: { subject: string; email: string; category: string; message: string }) => Promise<void>;
    onClose?: () => void;
}

const ContactFormPopup: ComponentType<Props> = ({ initEmail = '', onSubmit, onClose }) => {
    const form = useMemo(() => new FormModel(), []);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const isMountedRef = useRef<boolean>(true);
    const onSubmitCallback = useCallback((): Promise<void> => {
        if (isLoading || !onSubmit) {
            return Promise.resolve();
        }

        setIsLoading(true);

        return (
            // @ts-ignore serialize() returns Record<string, string>, but we exactly know returning keys
            onSubmit(form.serialize())
                .catch((resp) => {
                    if (resp.errors) {
                        form.setErrors(resp.errors);

                        return;
                    }
                })
                .finally(() => isMountedRef.current && setIsLoading(false))
        );
    }, [isLoading, onSubmit]);

    useEffect(
        () => () => {
            isMountedRef.current = false;
        },
        [],
    );

    return (
        <Popup
            title={<Message key="title" defaultMessage="Feedback form" />}
            wrapperClassName={styles.contactFormBoundings}
            onClose={onClose}
            data-testid="feedbackPopup"
        >
            <Form form={form} onSubmit={onSubmitCallback} isLoading={isLoading}>
                <div className={styles.body}>
                    <div className={styles.philosophicalThought}>
                        <Message
                            key="philosophicalThought"
                            defaultMessage="Properly formulated question — half of the answer"
                        />
                    </div>

                    <div className={styles.formDisclaimer}>
                        <Message
                            key="disclaimer"
                            defaultMessage="Please formulate your feedback providing as much useful information, as possible to help us understand your problem and solve it"
                        />
                        <br />
                    </div>

                    <div className={styles.pairInputRow}>
                        <div className={styles.pairInput}>
                            <Input {...form.bindField('subject')} required label={labels.subject} skin="light" />
                        </div>

                        <div className={styles.pairInput}>
                            <Input
                                {...form.bindField('email')}
                                required
                                label={labels.email}
                                type="email"
                                skin="light"
                                defaultValue={initEmail}
                            />
                        </div>
                    </div>

                    <div className={styles.formMargin}>
                        <Dropdown
                            {...form.bindField('category')}
                            label={labels.whichQuestion}
                            items={CONTACT_CATEGORIES}
                            block
                        />
                    </div>

                    <TextArea
                        {...form.bindField('message')}
                        required
                        label={labels.message}
                        skin="light"
                        minRows={6}
                        maxRows={6}
                    />
                </div>

                <Button block type="submit" disabled={isLoading}>
                    <Message key="send" defaultMessage="Send" />
                </Button>
            </Form>
        </Popup>
    );
};

export default ContactFormPopup;
