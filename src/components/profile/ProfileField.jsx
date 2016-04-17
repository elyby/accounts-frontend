import React, { Component, PropTypes } from 'react';

import { Link } from 'react-router';

import styles from './profile.scss';

export default class ProfileField extends Component {
    static displayName = 'ProfileField';
    static propTypes = {
        label: React.PropTypes.oneOfType([PropTypes.string, PropTypes.element]).isRequired,
        link: PropTypes.string,
        value: React.PropTypes.oneOfType([PropTypes.string, PropTypes.element]).isRequired,
        warningMessage: React.PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
        readonly: PropTypes.bool
    };

    render() {
        const {label, value, warningMessage, readonly, link = '#'} = this.props;

        return (
            <div className={styles.paramItem}>
                <div className={styles.paramRow}>
                    <div className={styles.paramName}>{label}:</div>
                    <div className={styles.paramValue}>{value}</div>

                    {readonly ? '' : (
                        <div className={styles.paramAction}>
                            <Link to={link}>
                                <span className={styles.paramEditIcon} />
                            </Link>
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
