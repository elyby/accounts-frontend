import React from 'react';
import type { Decorator } from '@storybook/react';

import { ContextProvider } from 'app/shell';
import { browserHistory } from 'app/services/history';
import storeFactory from 'app/storeFactory';
import 'app/index.scss';

import { IntlDecorator } from './decorators';

const store = storeFactory();

const storyDecorator: Decorator = (story, context) => (
    <ContextProvider store={store} history={browserHistory}>
        <IntlDecorator locale={context.globals.locale}>{story()}</IntlDecorator>
    </ContextProvider>
);

export default storyDecorator;
