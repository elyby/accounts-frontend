import React from 'react';
import { action } from '@storybook/addon-actions';

import ContactFormPopup from './ContactFormPopup';

export default { title: 'Components/Popups' };

export const ContactFormPopupStory = () => (
    <ContactFormPopup
        onSubmit={(params) => {
            action('onSubmit')(params);

            return Promise.resolve();
        }}
        onClose={action('onClose')}
    />
);
ContactFormPopupStory.storyName = 'ContactFormPopup';
