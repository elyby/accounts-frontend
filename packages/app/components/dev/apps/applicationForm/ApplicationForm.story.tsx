import React, { useState } from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import { OauthAppResponse } from 'app/services/api/oauth';
import { FormModel } from 'app/components/ui/form';
import { ApplicationType, TYPE_APPLICATION, TYPE_MINECRAFT_SERVER } from 'app/components/dev/apps';
import ApplicationForm from './ApplicationForm';
import { DevLayout } from '../ApplicationsIndex.story';

const blankApp: OauthAppResponse = {
    clientId: '',
    clientSecret: '',
    type: TYPE_APPLICATION,
    name: '',
    websiteUrl: '',
    createdAt: 0,
    countUsers: 0,
    description: '',
    redirectUri: '',
    minecraftServerIp: '',
};

const onSubmit = async (form: FormModel) => action('onSubmit')(form);

storiesOf('Components/Dev/Apps/ApplicationForm', module)
    .addDecorator((storyFn) => <DevLayout>{storyFn()}</DevLayout>)
    .add('Create', () => {
        const [currentType, setType] = useState<ApplicationType | null>(null);

        return (
            <ApplicationForm
                form={new FormModel()}
                onSubmit={onSubmit}
                displayTypeSwitcher
                type={currentType}
                setType={(type) => {
                    action('setType')(type);
                    setType(type);
                }}
                app={blankApp}
            />
        );
    })
    .add('Create website', () => (
        <ApplicationForm
            form={new FormModel()}
            onSubmit={onSubmit}
            displayTypeSwitcher
            type={TYPE_APPLICATION}
            setType={action('setType')}
            app={blankApp}
        />
    ))
    .add('Create Minecraft server', () => (
        <ApplicationForm
            form={new FormModel()}
            onSubmit={onSubmit}
            displayTypeSwitcher
            type={TYPE_MINECRAFT_SERVER}
            setType={action('setType')}
            app={{
                ...blankApp,
                type: TYPE_MINECRAFT_SERVER,
            }}
        />
    ))
    .add('Update website', () => (
        <ApplicationForm
            form={new FormModel()}
            onSubmit={onSubmit}
            type={TYPE_APPLICATION}
            app={{
                ...blankApp,
                clientId: 'already-registered',
            }}
        />
    ))
    .add('Update Minecraft server', () => (
        <ApplicationForm
            form={new FormModel()}
            onSubmit={onSubmit}
            type={TYPE_MINECRAFT_SERVER}
            app={{
                ...blankApp,
                type: TYPE_MINECRAFT_SERVER,
                clientId: 'already-registered',
            }}
        />
    ));
