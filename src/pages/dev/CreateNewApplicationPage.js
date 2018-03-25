// @flow
import React, { Component } from 'react';

import { FormModel } from 'components/ui/form';

import ApplicationForm from 'components/dev/apps/applicationForm/ApplicationForm';

import oauth from 'services/api/oauth';
import { browserHistory } from 'services/history';

import type {OauthAppResponse} from 'services/api/oauth';

const app: OauthAppResponse = {
    clientId: '',
    clientSecret: '',
    countUsers: 0,
    createdAt: 0,
    type: '',
    name: '',
    description: '',
    websiteUrl: '',
    redirectUri: '',
    minecraftServerIp: '',
};

export default class CreateNewApplicationPage extends Component<{}, {
    type: ?string,
}> {
    static displayName = 'CreateNewApplicationPage';

    state = {
        type: null,
    };

    form = new FormModel();

    render() {
        return (
            <ApplicationForm
                form={this.form}
                displayTypeSwitcher
                onSubmit={this.onSubmit}
                type={this.state.type}
                setType={this.setType}
                app={app}
            />
        );
    }

    onSubmit = async () => {
        const { form } = this;
        const { type } = this.state;
        if (!type) {
            throw new Error('Form was submitted without specified type');
        }

        form.beginLoading();
        const result = await oauth.create(type, form.serialize());
        form.endLoading();

        this.goToMainPage(result.data.clientId);
    };

    setType = (type: string) => {
        this.setState({
            type,
        });
    };

    goToMainPage = (hash?: string) => browserHistory.push(`/dev/applications${hash ? `#${hash}` : ''}`);
}
