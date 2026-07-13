import React from 'react';
import { action } from '@storybook/addon-actions';

import SourceCodePopup from './SourceCodePopup';

export default { title: 'Components/Popups' };

export const SourceCodePopupStory = () => <SourceCodePopup onClose={action('onClose')} />;
SourceCodePopupStory.storyName = 'SourceCodePopup';
