import React from 'react';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { browserHistory } from 'app/services/history';
import { connect } from 'react-redux';
import { RootState } from 'app/reducers';

import { PopupConfig } from './reducer';
import { destroy } from './actions';
import styles from './popup.scss';

export class PopupStack extends React.Component<{
  popups: PopupConfig[];
  destroy: (popup: PopupConfig) => void;
}> {
  unlistenTransition: () => void;

  componentWillMount() {
    document.addEventListener('keyup', this.onKeyPress);
    this.unlistenTransition = browserHistory.listen(this.onRouteLeave);
  }

  componentWillUnmount() {
    document.removeEventListener('keyup', this.onKeyPress);
    this.unlistenTransition();
  }

  render() {
    const { popups } = this.props;

    return (
      <TransitionGroup>
        {popups.map((popup, index) => {
          const { Popup } = popup;

          return (
            <CSSTransition
              key={index}
              classNames={{
                enter: styles.trEnter,
                enterActive: styles.trEnterActive,
                exit: styles.trExit,
                exitActive: styles.trExitActive,
              }}
              timeout={500}
            >
              <div
                className={styles.overlay}
                onClick={this.onOverlayClick(popup)}
              >
                <Popup onClose={this.onClose(popup)} />
              </div>
            </CSSTransition>
          );
        })}
      </TransitionGroup>
    );
  }

  onClose(popup: PopupConfig) {
    return this.props.destroy.bind(null, popup);
  }

  onOverlayClick(popup: PopupConfig) {
    return (event: React.MouseEvent) => {
      if (event.target !== event.currentTarget || popup.disableOverlayClose) {
        return;
      }

      event.preventDefault();

      this.props.destroy(popup);
    };
  }

  popStack() {
    const [popup] = this.props.popups.slice(-1);

    if (popup && !popup.disableOverlayClose) {
      this.props.destroy(popup);
    }
  }

  onKeyPress = (event: KeyboardEvent) => {
    if (event.which === 27) {
      // ESC key
      this.popStack();
    }
  };

  onRouteLeave = nextLocation => {
    if (nextLocation) {
      this.popStack();
    }
  };
}

export default connect(
  (state: RootState) => ({
    ...state.popup,
  }),
  {
    destroy,
  },
)(PopupStack);
