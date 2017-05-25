import React, { Component, PropTypes } from 'react';

import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { browserHistory } from 'services/history';

import styles from './popup.scss';

export class PopupStack extends Component {
    static displayName = 'PopupStack';

    static propTypes = {
        popups: PropTypes.arrayOf(PropTypes.shape({
            type: PropTypes.func,
            props: PropTypes.oneOfType([PropTypes.object, PropTypes.func])
        })),
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
        const {popups} = this.props;

        return (
            <ReactCSSTransitionGroup
                transitionName={{
                    enter: styles.trEnter,
                    enterActive: styles.trEnterActive,
                    leave: styles.trLeave,
                    leaveActive: styles.trLeaveActive
                }}
                transitionEnterTimeout={500}
                transitionLeaveTimeout={500}
            >
                {popups.map((popup, index) => {
                    const {Popup} = popup;

                    return (
                        <div className={styles.overlay} key={index}
                            onClick={this.onOverlayClick(popup)}
                        >
                            <Popup onClose={this.onClose(popup)} />
                        </div>
                    );
                })}
            </ReactCSSTransitionGroup>
        );
    }

    onClose(popup) {
        return this.props.destroy.bind(null, popup);
    }

    onOverlayClick(popup) {
        return (event) => {
            if (event.target !== event.currentTarget || popup.disableOverlayClose) {
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
        if (event.which === 27) { // ESC key
            this.popStack();
        }
    };

    onRouteLeave = (nextLocation) => {
        if (nextLocation) {
            this.popStack();
        }
    };
}

import { connect } from 'react-redux';
import { destroy } from 'components/ui/popup/actions';

export default connect((state) => ({
    ...state.popup
}), {
    destroy
})(PopupStack);
