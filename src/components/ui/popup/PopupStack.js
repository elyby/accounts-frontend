import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { browserHistory } from 'services/history';
import { connect } from 'react-redux';
import { destroy } from 'components/ui/popup/actions';

import styles from './popup.scss';

export class PopupStack extends Component {
    static propTypes = {
        popups: PropTypes.arrayOf(
            PropTypes.shape({
                type: PropTypes.func,
                props: PropTypes.oneOfType([PropTypes.object, PropTypes.func])
            })
        ),
        destroy: PropTypes.func.isRequired
    };

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
                                exitActive: styles.trExitActive
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

    onClose(popup) {
        return this.props.destroy.bind(null, popup);
    }

    onOverlayClick(popup) {
        return (event) => {
            if (
                event.target !== event.currentTarget
                || popup.disableOverlayClose
            ) {
                return;
            }

            event.preventDefault();

            this.props.destroy(popup);
        };
    }

    popStack() {
        const popup = this.props.popups.slice(-1)[0];

        if (popup && !popup.disableOverlayClose) {
            this.props.destroy(popup);
        }
    }

    onKeyPress = (event) => {
        if (event.which === 27) {
            // ESC key
            this.popStack();
        }
    };

    onRouteLeave = (nextLocation) => {
        if (nextLocation) {
            this.popStack();
        }
    };
}

export default connect(
    (state) => ({
        ...state.popup
    }),
    {
        destroy
    }
)(PopupStack);
