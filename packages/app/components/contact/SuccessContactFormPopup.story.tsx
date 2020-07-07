import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import SuccessContactFormPopup from './SuccessContactFormPopup';

storiesOf('Components/Popups', module).add('SuccessContactFormPopup', () => (
    <SuccessContactFormPopup email="email@ely.by" onClose={action('onClose')} />
));
