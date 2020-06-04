import React from 'react';
import { defineMessages, FormattedMessage as Message } from 'react-intl';
import { Link } from 'react-router-dom';
import FormComponent from 'app/components/ui/form/FormComponent';

import styles from './profileForm.scss';

const { back: backMsg } = defineMessages({
    back: 'Back',
});

export class BackButton extends FormComponent<{
    to: string;
}> {
    static defaultProps = {
        to: '/',
    };

    render() {
        const { to } = this.props;

        return (
            <Link
                className={styles.backButton}
                to={to}
                title={this.formatMessage(backMsg)}
                data-testid="back-to-profile"
            >
                <span className={styles.backIcon} />
                <span className={styles.backText}>
                    <Message {...backMsg} />
                </span>
            </Link>
        );
    }
}
