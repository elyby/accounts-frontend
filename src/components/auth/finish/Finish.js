import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { connect } from 'react-redux';
import { FormattedMessage as Message } from 'react-intl';
import Helmet from 'react-helmet';

import { Button } from 'components/ui/form';

import messages from './Finish.intl.json';
import styles from './finish.scss';

class Finish extends Component {
    static displayName = 'Finish';

    static propTypes = {
        appName: PropTypes.string.isRequired,
        code: PropTypes.string.isRequired,
        state: PropTypes.string.isRequired,
        displayCode: PropTypes.bool,
        success: PropTypes.bool
    };

    state = {
        isCopySupported: document.queryCommandSupported && document.queryCommandSupported('copy')
    };

    render() {
        const {appName, code, state, displayCode, success} = this.props;
        const {isCopySupported} = this.state;
        const authData = JSON.stringify({
            auth_code: code, // eslint-disable-line
            state
        });

        history.pushState(null, null, `#${authData}`);

        return (
            <div className={styles.finishPage}>
                <Helmet title={authData} />

                {success ? (
                    <div>
                        <div className={styles.successBackground} />
                        <div className={styles.greenTitle}>
                            <Message {...messages.authForAppSuccessful} values={{
                                appName: (<span className={styles.appName}>{appName}</span>)
                            }} />
                        </div>
                        {displayCode ? (
                            <div>
                                <div className={styles.description}>
                                    <Message {...messages.passCodeToApp} values={{appName}} />
                                </div>
                                <div className={styles.codeContainer}>
                                    <div className={styles.code} ref={this.setCode}>{code}</div>
                                </div>
                                {isCopySupported ? (
                                    <Button
                                        color="green"
                                        small
                                        label={messages.copy}
                                        onClick={this.onCopyClick}
                                    />
                                ) : (
                                    ''
                                )}
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
                            <Message {...messages.authForAppFailed} values={{
                                appName: (<span className={styles.appName}>{appName}</span>)
                            }} />
                        </div>
                        <div className={styles.description}>
                            <Message {...messages.waitAppReaction} />
                        </div>
                    </div>
                )}
            </div>
        );
    }

    onCopyClick = (event) => {
        event.preventDefault();
        // http://stackoverflow.com/a/987376/5184751

        try {
            const selection = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(this.code);
            selection.removeAllRanges();
            selection.addRange(range);

            const successful = document.execCommand('copy');
            selection.removeAllRanges();

            // TODO: было бы ещё неплохо сделать какую-то анимацию, вроде "Скопировано",
            // ибо сейчас после клика как-то неубедительно, скопировалось оно или нет
            console.log('Copying text command was %s', successful ? 'successful' : 'unsuccessful');
        } catch (err) {
            // not critical
        }
    };

    setCode = (el) => {
        this.code = el;
    };
}

export default connect(({auth}) => ({
    appName: auth.client.name,
    code: auth.oauth.code,
    displayCode: auth.oauth.displayCode,
    state: auth.oauth.state,
    success: auth.oauth.success
}))(Finish);
