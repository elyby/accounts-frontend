import React from 'react';
import { connect } from 'react-redux';
import { FormattedMessage as Message } from 'react-intl';
import Helmet from 'react-helmet';
import { Button } from 'app/components/ui/form';
import copy from 'app/services/copy';
import { RootState } from 'app/reducers';

import messages from './Finish.intl.json';
import styles from './finish.scss';

interface Props {
  appName: string;
  code?: string;
  state: string;
  displayCode?: string;
  success?: boolean;
}

class Finish extends React.Component<Props> {
  render() {
    const { appName, code, state, displayCode, success } = this.props;
    const authData = JSON.stringify({
      // eslint-disable-next-line @typescript-eslint/camelcase
      auth_code: code,
      state,
    });

    history.pushState(null, document.title, `#${authData}`);

    return (
      <div className={styles.finishPage}>
        <Helmet title={authData} />

        {success ? (
          <div>
            <div className={styles.successBackground} />
            <div className={styles.greenTitle}>
              <Message
                {...messages.authForAppSuccessful}
                values={{
                  appName: <span className={styles.appName}>{appName}</span>,
                }}
              />
            </div>
            {displayCode ? (
              <div data-testid="oauth-code-container">
                <div className={styles.description}>
                  <Message {...messages.passCodeToApp} values={{ appName }} />
                </div>
                <div className={styles.codeContainer}>
                  <div className={styles.code}>{code}</div>
                </div>
                <Button
                  color="green"
                  small
                  label={messages.copy}
                  onClick={this.onCopyClick}
                />
              </div>
            ) : (
              <div className={styles.description}>
                <Message {...messages.waitAppReaction} />
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className={styles.failBackground} />
            <div className={styles.redTitle}>
              <Message
                {...messages.authForAppFailed}
                values={{
                  appName: <span className={styles.appName}>{appName}</span>,
                }}
              />
            </div>
            <div className={styles.description}>
              <Message {...messages.waitAppReaction} />
            </div>
          </div>
        )}
      </div>
    );
  }

  onCopyClick = event => {
    event.preventDefault();

    const { code } = this.props;

    if (code) {
      copy(code);
    }
  };
}

export default connect(({ auth }: RootState) => {
  if (!auth || !auth.client || !auth.oauth) {
    throw new Error('Can not connect Finish component. No auth data in state');
  }

  return {
    appName: auth.client.name,
    code: auth.oauth.code,
    displayCode: auth.oauth.displayCode,
    state: auth.oauth.state,
    success: auth.oauth.success,
  };
})(Finish);
