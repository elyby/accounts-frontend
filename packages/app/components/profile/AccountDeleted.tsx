import React, { ComponentType } from 'react';
import { FormattedMessage as Message } from 'react-intl';
import { Helmet } from 'react-helmet-async';

import { Button } from 'app/components/ui/form';

import styles from './accountDeleted.scss';

interface Props {
    onRestore?: () => void;
}

const AccountDeleted: ComponentType<Props> = ({ onRestore }) => {
    return (
        <div className={styles.wrapper}>
            <Message key="accountDeleted" defaultMessage="Account deleted">
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
                    // TODO: verify translation
                    defaultMessage="The account has been marked for deletion and will be permanently removed within a week. Until then, all activity on the account has been suspended."
                />
            </div>

            <div className={styles.description}>
                <Message
                    key="ifYouWantToRestoreAccount"
                    // TODO: verify translation
                    defaultMessage="If you want to restore your account, click on the button below."
                />
            </div>

            <Button onClick={onRestore} color="black" small>
                <Message key="restoreAccount" defaultMessage="Restore account" />
            </Button>
        </div>
    );
};

export default AccountDeleted;
