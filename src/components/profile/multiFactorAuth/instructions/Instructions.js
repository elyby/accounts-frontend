// @flow
import React, { Component } from 'react';

import { FormattedMessage as Message } from 'react-intl';
import classNames from 'classnames';

import profileForm from 'components/profile/profileForm.scss';
import messages from '../MultiFactorAuth.intl.json';

import OsInstruction from './OsInstruction';
import OsTile from './OsTile';
import styles from './instructions.scss';
import androidLogo from './images/android.svg';
import appleLogo from './images/apple.svg';
import windowsLogo from './images/windows.svg';

export default class Instructions extends Component<{}, {
    activeOs: null|'android'|'ios'|'windows'
}> {
    state: {
        activeOs: null|'android'|'ios'|'windows'
    } = {
        activeOs: null
    };

    render() {
        const {activeOs} = this.state;

        return (
            <div className={profileForm.formBody}>
                <div className={profileForm.formRow}>
                    <p className={profileForm.description}>
                        <Message {...messages.mfaIntroduction} />
                    </p>
                </div>

                <div className={profileForm.formRow}>
                    <div className={classNames(styles.instructionContainer, {
                        [styles.instructionActive]: !!activeOs
                    })}>
                        <div className={classNames(styles.osList, {
                            [styles.androidActive]: activeOs === 'android',
                            [styles.appleActive]: activeOs === 'ios',
                            [styles.windowsActive]: activeOs === 'windows'
                        })}>
                            <OsTile
                                className={styles.androidTile}
                                logo={androidLogo}
                                label="Google Play"
                                onClick={(event) => this.onChangeOs(event, 'android')}
                            />
                            <OsTile
                                className={styles.appleTile}
                                logo={appleLogo}
                                label="App Store"
                                onClick={(event) => this.onChangeOs(event, 'ios')}
                            />
                            <OsTile
                                className={styles.windowsTile}
                                logo={windowsLogo}
                                label="Windows Store"
                                onClick={(event) => this.onChangeOs(event, 'windows')}
                            />
                        </div>

                        <div className={styles.osInstructionContainer}>
                            {activeOs ? (
                                <OsInstruction os={activeOs} />
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    onChangeOs(event: MouseEvent, osName: 'android'|'ios'|'windows') {
        event.preventDefault();

        this.setState({
            activeOs: osName
        });
    }
}
