import React, { useState } from 'react';
import { action } from '@storybook/addon-actions';

import { OauthAppResponse } from 'app/services/api/oauth';
import { FormModel } from 'app/components/ui/form';
import {
    ApplicationType,
    TYPE_WEB_APPLICATION,
    TYPE_DESKTOP_APPLICATION,
    TYPE_MINECRAFT_SERVER,
} from 'app/components/dev/apps';
import ApplicationForm from './ApplicationForm';
import { DevLayout } from '../ApplicationsIndex.story';

const blankApp: OauthAppResponse = {
    clientId: '',
    clientSecret: '',
    type: TYPE_WEB_APPLICATION,
    name: '',
    websiteUrl: '',
    createdAt: 0,
    countUsers: 0,
    description: '',
    redirectUri: '',
    minecraftServerIp: '',
};

const onSubmit = async (form: FormModel) => action('onSubmit')(form);

export default {
    title: 'Components/Dev/Apps/ApplicationForm',
    decorators: [(storyFn: () => React.ReactElement) => <DevLayout>{storyFn()}</DevLayout>],
};

export const Create = () => {
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
};

export const CreateWebsite = () => (
    <ApplicationForm
        form={new FormModel()}
        onSubmit={onSubmit}
        displayTypeSwitcher
        type={TYPE_WEB_APPLICATION}
        setType={action('setType')}
        app={blankApp}
    />
);
CreateWebsite.storyName = 'Create website';

export const CreateDesktopApplication = () => (
    <ApplicationForm
        form={new FormModel()}
        onSubmit={onSubmit}
        displayTypeSwitcher
        type={TYPE_DESKTOP_APPLICATION}
        setType={action('setType')}
        app={blankApp}
    />
);
CreateDesktopApplication.storyName = 'Create desktop application';

export const CreateMinecraftServer = () => (
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
);
CreateMinecraftServer.storyName = 'Create Minecraft server';

export const UpdateWebsite = () => (
    <ApplicationForm
        form={new FormModel()}
        onSubmit={onSubmit}
        type={TYPE_WEB_APPLICATION}
        app={{
            ...blankApp,
            clientId: 'already-registered',
        }}
    />
);
UpdateWebsite.storyName = 'Update website';

export const UpdateMinecraftServer = () => (
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
);
UpdateMinecraftServer.storyName = 'Update Minecraft server';
