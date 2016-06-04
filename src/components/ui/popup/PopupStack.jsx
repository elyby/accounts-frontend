import React, { Component, PropTypes } from 'react';

import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

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
                    const Popup = popup.type;

                    const defaultProps = {
                        onClose: this.onClose(popup)
                    };
                    const props = typeof popup.props === 'function'
                        ? popup.props(defaultProps)
                        : {...defaultProps, ...popup.props};

                    return (
                        <div className={styles.overlay} key={index} onClick={this.onOverlayClick(popup, props)}>
                            <div className={styles.popupWrapper}>
                                <div className={styles.popup}>
                                    <Popup {...props} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </ReactCSSTransitionGroup>
        );
    }

    onClose(popup) {
        return this.props.destroy.bind(null, popup);
    }

    onOverlayClick(popup, popupProps) {
        return (event) => {
            if (event.target !== event.currentTarget || popupProps.disableOverlayClose) {
                return;
            }

            event.preventDefault();

            this.props.destroy(popup);
        };
    }
}

import { connect } from 'react-redux';
import { destroy } from 'components/ui/popup/actions';

export default connect((state) => ({
    ...state.popup
}), {
    destroy
})(PopupStack);
