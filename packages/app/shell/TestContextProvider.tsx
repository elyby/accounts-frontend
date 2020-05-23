import React from 'react';
import { createMemoryHistory } from 'history';
import storeFactory from 'app/storeFactory';

import ContextProvider from './ContextProvider';

type ContextProps = React.ComponentProps<typeof ContextProvider>;

function TestContextProvider(props: Partial<ContextProps> & { children: ContextProps['children'] }) {
    const store = React.useMemo(storeFactory, []);
    const history = React.useMemo(createMemoryHistory, []);

    return <ContextProvider store={store} history={history} {...props} />;
}

export default TestContextProvider;
