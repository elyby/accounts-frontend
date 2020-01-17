import React from 'react';
import { connect } from 'react-redux';
import logger from 'app/services/logger';
import { RouteComponentProps } from 'react-router';
import { FormModel } from 'app/components/ui/form';
import { browserHistory } from 'app/services/history';
import oauth from 'app/services/api/oauth';
import * as loader from 'app/services/loader';
import PageNotFound from 'app/pages/404/PageNotFound';
import {
  getApp,
  fetchApp as fetchAppAction,
} from 'app/components/dev/apps/actions';
import ApplicationForm from 'app/components/dev/apps/applicationForm/ApplicationForm';
import { OauthAppResponse } from 'app/services/api/oauth';
import { RootState } from 'app/reducers';

type OwnProps = RouteComponentProps<{
  clientId: string;
}>;

interface Props extends OwnProps {
  app: OauthAppResponse | null;
  fetchApp: (app: string) => Promise<void>;
}

class UpdateApplicationPage extends React.Component<
  Props,
  {
    isNotFound: boolean;
  }
> {
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
      return <PageNotFound />;
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

  goToMainPage = (hash?: string) =>
    browserHistory.push(`/dev/applications${hash ? `#${hash}` : ''}`);
}

export default connect(
  (state: RootState, props: OwnProps) => ({
    app: getApp(state, props.match.params.clientId),
  }),
  {
    fetchApp: fetchAppAction,
  },
)(UpdateApplicationPage);
