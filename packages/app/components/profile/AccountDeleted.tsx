import React, { ComponentType, useCallback, useState } from 'react';
import { FormattedMessage as Message } from 'react-intl';
import { Helmet } from 'react-helmet-async';

import { Button } from 'app/components/ui/form';

import styles from './accountDeleted.scss';

interface Props {
    onRestore?: () => Promise<void>;
}

const AccountDeleted: ComponentType<Props> = ({ onRestore }) => {
    const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
    const onRestoreClick = useCallback(() => {
        if (!onRestore) {
            return;
        }

        setIsSubmitted(true);
        onRestore().finally(() => setIsSubmitted(false));
    }, [onRestore]);

    return (
        <div className={styles.wrapper} data-testid="deletedAccount">
            <Message key="accountDeleted" defaultMessage="Account is deleted">
                {(pageTitle: string) => (
                    <h2 className={styles.title}>
                        <Helmet title={pageTitle} />
                        {pageTitle}
                    </h2>
                )}
            </Message>

            <div className={styles.description}>
                <Message
                    key="accountDeletedDescription"
                    defaultMessage="The account has been marked for deletion and will be permanently removed within a week. Until then, all account activities have been suspended."
                />
            </div>

            <div className={styles.description}>
                <Message
                    key="ifYouWantToRestoreAccount"
                    defaultMessage="If you want to restore your account, click on the button below."
                />
            </div>

            <Button onClick={onRestoreClick} color="black" small loading={isSubmitted}>
                <Message key="restoreAccount" defaultMessage="Restore account" />
            </Button>
        </div>
    );
};

export default AccountDeleted;
