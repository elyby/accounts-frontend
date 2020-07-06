import React, { ComponentProps, ComponentType } from 'react';
import { FormattedMessage as Message } from 'react-intl';

import Popup from 'app/components/ui/popup';
import { Button } from 'app/components/ui/form';

import styles from './contactForm.scss';

interface Props {
    email: string;
    onClose?: ComponentProps<typeof Popup>['onClose'];
}

const SuccessContactFormPopup: ComponentType<Props> = ({ email, onClose }) => (
    <Popup
        title={<Message key="title" defaultMessage="Feedback form" />}
        wrapperClassName={styles.successStateBoundings}
        onClose={onClose}
        data-testid="feedbackPopup"
    >
        <div className={styles.successBody}>
            <span className={styles.successIcon} />
            <div className={styles.successDescription}>
                <Message
                    key="youMessageReceived"
                    defaultMessage="Your message was received. We will respond to you shortly. The answer will come to your E‑mail:"
                />
            </div>
            <div className={styles.sentToEmail}>{email}</div>
        </div>

        <div className={styles.footer}>
            <Button label={<Message key="close" defaultMessage="Close" />} block onClick={onClose} />
        </div>
    </Popup>
);

export default SuccessContactFormPopup;
