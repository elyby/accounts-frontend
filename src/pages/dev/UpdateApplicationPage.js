// @flow
import type { OauthAppResponse } from 'services/api/oauth';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import logger from 'services/logger';
import { FormModel } from 'components/ui/form';
import { browserHistory } from 'services/history';
import oauth from 'services/api/oauth';
import loader from 'services/loader';
import PageNotFound from 'pages/404/PageNotFound';
import { getApp, fetchApp } from 'components/dev/apps/actions';
import ApplicationForm from 'components/dev/apps/applicationForm/ApplicationForm';

type MatchType = {
    match: {
        params: {
            clientId: string,
        },
    },
};

class UpdateApplicationPage extends Component<{
    app: ?OauthAppResponse,
    fetchApp: (string) => Promise<void>,
} & MatchType, {
    isNotFound: bool,
}> {
    form: FormModel = new FormModel();

    state = {
        isNotFound: false,
    };

    componentDidMount() {
        this.props.app === null && this.fetchApp();
    }

    render() {
        const { app } = this.props;

        if (this.state.isNotFound) {
            return (
                <PageNotFound />
            );
        }

        if (!app) {
            // we are loading
            return null;
        }

        return (
            <ApplicationForm
                form={this.form}
                onSubmit={this.onSubmit}
                app={app}
                type={app.type}
            />
        );
    }

    async fetchApp() {
        const { fetchApp, match } = this.props;

        try {
            loader.show();
            await fetchApp(match.params.clientId);
        } catch (resp) {
            const { status } = resp.originalResponse;

            if (status === 403) {
                this.goToMainPage();
                return;
            }

            if (status === 404) {
                this.setState({
                    isNotFound: true,
                });
                return;
            }

            logger.unexpected('Error fetching app', resp);
        } finally {
            loader.hide();
        }
    }

    onSubmit = async () => {
        const { form } = this;
        const { app } = this.props;

        if (!app || !app.clientId) {
            throw new Error('Form has an invalid state');
        }

        form.beginLoading();
        const result = await oauth.update(app.clientId, form.serialize());
        form.endLoading();

        this.goToMainPage(result.data.clientId);
    };

    goToMainPage = (hash?: string) => browserHistory.push(`/dev/applications${hash ? `#${hash}` : ''}`);
}

export default connect((state, props: MatchType) => ({
    app: getApp(state, props.match.params.clientId),
}), {
    fetchApp,
})(UpdateApplicationPage);
