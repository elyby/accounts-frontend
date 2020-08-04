import React, { ComponentType, ComponentProps } from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import ApplicationsIndex from './ApplicationsIndex';
import { TYPE_APPLICATION } from 'app/components/dev/apps';

import { OauthAppResponse } from 'app/services/api/oauth';
import rootStyles from 'app/pages/root/root.scss';
import devStyles from 'app/pages/dev/dev.scss';

export const DevLayout: ComponentType = ({ children }) => (
    <div className={rootStyles.wrapper}>
        <div className={devStyles.container}>{children}</div>
    </div>
);

export const sampleApp: OauthAppResponse = {
    clientId: 'my-application',
    clientSecret: 'cL1eNtS3cRE7xNJqfWQdqrMRKURfW1ssP4kiX6JDW0_szM-n-q',
    type: TYPE_APPLICATION,
    name: 'My Application',
    websiteUrl: '',
    createdAt: 0,
    countUsers: 0,
};

const commonProps: Omit<ComponentProps<typeof ApplicationsIndex>, 'isLoading' | 'displayForGuest' | 'applications'> = {
    clientId: null,
    resetClientId: action('resetClientId'),
    resetApp: async (...args) => action('resetApp')(...args),
    deleteApp: async (clientId) => action('deleteApp')(clientId),
};

storiesOf('Components/Dev/Apps/ApplicationsIndex', module)
    .addDecorator((storyFn) => <DevLayout>{storyFn()}</DevLayout>)
    .add('Guest', () => <ApplicationsIndex isLoading={false} displayForGuest applications={[]} {...commonProps} />)
    .add('Loading', () => <ApplicationsIndex isLoading displayForGuest={false} applications={[]} {...commonProps} />)
    .add('Empty', () => (
        <ApplicationsIndex isLoading={false} displayForGuest={false} applications={[]} {...commonProps} />
    ))
    .add('With apps', () => (
        <ApplicationsIndex
            isLoading={false}
            displayForGuest={false}
            applications={[
                sampleApp,
                { ...sampleApp, clientId: 'my-application1', countUsers: 10 },
                { ...sampleApp, clientId: 'my-application2', countUsers: 1 },
            ]}
            {...commonProps}
        />
    ));
