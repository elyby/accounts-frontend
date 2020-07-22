import React, { ComponentType, useCallback, useRef, useState } from 'react';

import { send as sendFeedback } from 'app/services/api/feedback';
import logger from 'app/services/logger';
import { useReduxSelector } from 'app/functions';

import ContactFormPopup from './ContactFormPopup';
import SuccessContactFormPopup from './SuccessContactFormPopup';

interface Props {
    onClose?: () => void;
}

const ContactForm: ComponentType<Props> = ({ onClose }) => {
    const userEmail = useReduxSelector((state) => state.user.email);
    const usedEmailRef = useRef(userEmail); // Use ref to avoid unneeded redraw
    const [isSent, setIsSent] = useState<boolean>(false);
    const onSubmit = useCallback(
        (params: Parameters<typeof sendFeedback>[0]): Promise<void> =>
            sendFeedback(params)
                .then(() => {
                    setIsSent(true);
                    usedEmailRef.current = params.email;
                })
                .catch((resp) => {
                    if (!resp.errors) {
                        logger.warn('Error sending feedback', resp);
                    }

                    throw resp;
                }),
        [],
    );

    return isSent ? (
        <SuccessContactFormPopup email={usedEmailRef.current} onClose={onClose} />
    ) : (
        <ContactFormPopup initEmail={userEmail} onSubmit={onSubmit} onClose={onClose} />
    );
};

export default ContactForm;
