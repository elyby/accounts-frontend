import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import LoggedInPanel from './LoggedInPanel';

const activeAccount = {
    id: 1,
    username: 'MockUser',
    email: 'mock@ely.by',
    refreshToken: '',
    token: '',
};

storiesOf('Components/Userbar', module)
    .addDecorator((storyFn) => (
        <div style={{ background: '#207e5c', paddingRight: '10px', textAlign: 'right' }}>{storyFn()}</div>
    ))
    .add('LoggedInPanel', () => (
        <LoggedInPanel
            activeAccount={activeAccount}
            accounts={[
                activeAccount,
                {
                    id: 2,
                    username: 'AnotherMockUser',
                    email: 'mock-user2@ely.by',
                    token: '',
                    refreshToken: '',
                },
            ]}
            onSwitchAccount={async (account) => action('onSwitchAccount')(account)}
            onRemoveAccount={async (account) => action('onRemoveAccount')(account)}
        />
    ));
