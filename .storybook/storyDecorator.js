import React from 'react';
import { ContextProvider } from 'app/shell';
import { browserHistory } from 'app/services/history';
import storeFactory from 'app/storeFactory';

const store = storeFactory();

export default story => (
  <ContextProvider store={store} history={browserHistory}>
    {story()}
  </ContextProvider>
);
