import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import ContactFormPopup from './ContactFormPopup';

storiesOf('Components/Popups', module).add('ContactFormPopup', () => (
    <ContactFormPopup
        onSubmit={(params) => {
            action('onSubmit')(params);

            return Promise.resolve();
        }}
        onClose={action('onClose')}
    />
));
