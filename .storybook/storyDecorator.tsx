import React from 'react';
import addons, { DecoratorFunction } from '@storybook/addons';
import { ContextProvider } from 'app/shell';
import { browserHistory } from 'app/services/history';
import storeFactory from 'app/storeFactory';
import 'app/index.scss';

import { IntlDecorator } from './decorators';

const store = storeFactory();

export default (story => {
  const channel = addons.getChannel();

  return (
    <ContextProvider store={store} history={browserHistory}>
      <IntlDecorator channel={channel}>{story()}</IntlDecorator>
    </ContextProvider>
  );
}) as DecoratorFunction<React.ReactElement>;
