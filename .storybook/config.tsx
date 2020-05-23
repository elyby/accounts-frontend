import { configure, addDecorator } from '@storybook/react';

import storyDecorator from './storyDecorator';

const req = require.context('../packages/app', true, /\.story\.[tj]sx?$/);

function loadStories() {
    req.keys().forEach((filename) => req(filename));
}

addDecorator(storyDecorator);

configure(loadStories, module);
