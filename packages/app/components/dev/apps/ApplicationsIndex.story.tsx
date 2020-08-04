import React, { ComponentType } from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import ApplicationsIndex from './ApplicationsIndex';
import { TYPE_APPLICATION } from '.';

import rootStyles from 'app/pages/root/root.scss';
import devStyles from 'app/pages/dev/dev.scss';

export const DevLayout: ComponentType = ({ children }) => (
    <div className={rootStyles.wrapper}>
        <div className={devStyles.container}>{children}</div>
    </div>
);

export const sampleApp = {
    clientId: 'my-application',
    clientSecret: 'cL1eNtS3cRE7xNJqfWQdqrMRKURfW1ssP4kiX6JDW0_szM-n-q',
    type: TYPE_APPLICATION,
    name: 'My Application',
    websiteUrl: '',
    createdAt: 0,
    countUsers: 0,
};

const commonProps = {
    clientId: null,
    resetClientId: action('resetClientId'),
    resetApp(...args: [string, boolean]) {
        action('resetApp')(...args);

        return Promise.resolve();
    },
    deleteApp(clientId: string) {
        action('deleteApp')(clientId);

        return Promise.resolve();
    },
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
