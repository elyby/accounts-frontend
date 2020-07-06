import React, { ComponentType } from 'react';
import { createMemoryHistory } from 'history';
import { DeepPartial } from 'utility-types';

import storeFactory from 'app/storeFactory';
import { RootState } from 'app/reducers';

import ContextProvider from './ContextProvider';

type NotOverriddenProps = Omit<React.ComponentProps<typeof ContextProvider>, 'store' | 'history'>;
type Props = NotOverriddenProps & {
    state?: DeepPartial<RootState>;
};

const TestContextProvider: ComponentType<Props> = ({ state = {}, children, ...props }) => {
    const store = React.useMemo(() => storeFactory(state), []);
    const history = React.useMemo(createMemoryHistory, []);

    return (
        <ContextProvider store={store} history={history} {...props}>
            {children}
        </ContextProvider>
    );
};

export default TestContextProvider;
