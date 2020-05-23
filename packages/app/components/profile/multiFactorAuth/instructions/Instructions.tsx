import React from 'react';
import { FormattedMessage as Message } from 'react-intl';
import clsx from 'clsx';

import profileForm from '../../profileForm.scss';
import messages from '../MultiFactorAuth.intl.json';
import OsInstruction from './OsInstruction';
import OsTile from './OsTile';
import styles from './instructions.scss';
import androidLogo from './images/android.svg';
import appleLogo from './images/apple.svg';
import windowsLogo from './images/windows.svg';

interface State {
  activeOs: null | 'android' | 'ios' | 'windows';
}

export default class Instructions extends React.Component<{}, State> {
  state: State = {
    activeOs: null,
  };

  render() {
    const { activeOs } = this.state;

    return (
      <div className={profileForm.formBody}>
        <div className={profileForm.formRow}>
          <p className={profileForm.description}>
            <Message {...messages.mfaIntroduction} />
          </p>
        </div>

        <div className={profileForm.formRow}>
          <div
            className={clsx(styles.instructionContainer, {
              [styles.instructionActive]: !!activeOs,
            })}
          >
            <div
              className={clsx(styles.osList, {
                [styles.androidActive]: activeOs === 'android',
                [styles.appleActive]: activeOs === 'ios',
                [styles.windowsActive]: activeOs === 'windows',
              })}
            >
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
              {activeOs ? <OsInstruction os={activeOs} /> : null}
            </div>
          </div>
        </div>
      </div>
    );
  }

  onChangeOs(event: React.MouseEvent, osName: 'android' | 'ios' | 'windows') {
    event.preventDefault();

    this.setState({
      activeOs: this.state.activeOs === osName ? null : osName,
    });
  }
}
