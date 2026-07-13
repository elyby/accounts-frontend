import React from 'react';
import { action } from '@storybook/addon-actions';

import SuccessContactFormPopup from './SuccessContactFormPopup';

export default { title: 'Components/Popups' };

export const SuccessContactFormPopupStory = () => (
    <SuccessContactFormPopup email="email@ely.by" onClose={action('onClose')} />
);
SuccessContactFormPopupStory.storyName = 'SuccessContactFormPopup';
