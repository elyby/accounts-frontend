import React, { Component, PropTypes } from 'react';

import { FormattedMessage as Message } from 'react-intl';
import Helmet from 'react-helmet';
import classNames from 'classnames';

import buttons from 'components/ui/buttons.scss';
import { Input } from 'components/ui/Form';

import BaseAuthBody from './BaseAuthBody';
import messages from './Finish.messages';

import styles from './finish.scss';

export default class Finish extends Component {
    static propTypes = {

    };

    state = {
        isSidebarHidden: false
    };

    handleCopyClick(selector) {
        // http://stackoverflow.com/a/987376/5184751
         var text = document.querySelector(selector);
         var range, selection;
        if (document.body.createTextRange) {
            range = document.body.createTextRange();
            range.moveToElementText(text);
            range.select();
        } else if (window.getSelection) {
            selection = window.getSelection();
            range = document.createRange();
            range.selectNodeContents(text);
            selection.removeAllRanges();
            selection.addRange(range);
        }

        try {
            var successful = document.execCommand('copy');
            // TODO: было бы ещё неплохо сделать какую-то анимацию, вроде "Скопировано",
            // ибо сейчас после клика как-то неубедительно, скопировалось оно или нет
            console.log('Copying text command was ' + (successful ? 'successful' : 'unsuccessful'));
        } catch (err) {
            console.error('Oops, unable to copy');
        }
    }

    render() {
        const withCode = true;
        const success = true;
        const appName = 'TLauncher';
        const code = 'HW9vkZA6Y4vRN3ciSm1IIDk98PHLkPPlv3jvo1MX';
        const copySupported = document.queryCommandSupported('copy');

        return (
            <div className={styles.finishPage}>
                {success ? (
                    <div>
                        <div className={styles.successBackground}></div>
                        <div className={styles.greenTitle}>
                            <Message {...messages.authForAppSuccessful} values={{
                                appName: (<span className={styles.appName}>{appName}</span>)
                            }} />
                        </div>
                        {withCode ? (
                            <div>
                                <div className={styles.description}>
                                    <Message {...messages.passCodeToApp} values={{appName}} />
                                </div>
                                <div className={styles.code}>{code}</div>
                                {copySupported ? (
                                    <div
                                        className={classNames(buttons.smallButton, buttons.green)}
                                        onClick={this.handleCopyClick.bind(this, '.' + styles.code)}
                                    >
                                        <Message {...messages.copy} />
                                    </div>
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
                        <div className={styles.failBackground}></div>
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
}
