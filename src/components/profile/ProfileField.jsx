import React, { Component, PropTypes } from 'react';

import styles from './profile.scss';

export default class ProfileField extends Component {
    static displayName = 'ProfileField';
    static propTypes = {
        label: PropTypes.string.isRequired,
        value: React.PropTypes.oneOfType([PropTypes.string, PropTypes.element]).isRequired,
        warningMessage: React.PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
        readonly: PropTypes.bool
    };

    render() {
        const {label, value, warningMessage, readonly} = this.props;

        return (
            <div className={styles.paramItem}>
                <div className={styles.paramRow}>
                    <div className={styles.paramName}>{label}:</div>
                    <div className={styles.paramValue}>{value}</div>

                    {readonly ? '' : (
                        <div className={styles.paramAction}>
                            <a href="#">
                                <span className={styles.paramEditIcon} />
                            </a>
                        </div>
                    )}
                </div>

                {warningMessage ? (
                    <div className={styles.paramMessage}>
                        {warningMessage}
                    </div>
                ) : ''}
            </div>
        );
    }
}
