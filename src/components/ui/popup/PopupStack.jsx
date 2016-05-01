import React, { Component, PropTypes } from 'react';

import styles from './popup.scss';

export class PopupStack extends Component {
    static displayName = 'PopupStack';

    static propTypes = {
        popups: PropTypes.arrayOf(PropTypes.shape({
            type: PropTypes.string.isRequired,
            props: PropTypes.oneOfType([PropTypes.object, PropTypes.func])
        })),
        pool: PropTypes.object.isRequired,
        destroy: PropTypes.func.isRequired
    };

    render() {
        const {popups, pool} = this.props;

        return (
            <div>
                {popups.map((popup, index) => {
                    const Popup = pool[popup.type];

                    if (!Popup) {
                        throw new Error(`Unknown popup type: ${popup.type}`);
                    }

                    const defaultProps = {
                        onClose: this.onClose(popup)
                    };
                    const props = typeof popup.props === 'function'
                        ? popup.props(defaultProps)
                        : {...defaultProps, ...popup.props};

                    return (
                        <div className={styles.overlay} key={popup.type + index}>
                            <div className={styles.popup}>
                                <Popup {...props} />
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }

    onClose(popup) {
        return this.props.destroy.bind(null, popup);
    }
}

import { connect } from 'react-redux';
import { destroy } from 'components/ui/popup/actions';

export default connect((state) => ({
    ...state.popup
}), {
    destroy
})(PopupStack);
