import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import SourceCodePopup from './SourceCodePopup';

storiesOf('Components/Popups', module).add('SourceCodePopup', () => <SourceCodePopup onClose={action('onClose')} />);
