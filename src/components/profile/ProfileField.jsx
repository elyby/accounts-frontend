import React, { Component, PropTypes } from 'react';

import { Link } from 'react-router';

import styles from './profile.scss';

export default class ProfileField extends Component {
    static displayName = 'ProfileField';
    static propTypes = {
        label: React.PropTypes.oneOfType([PropTypes.string, PropTypes.element]).isRequired,
        link: PropTypes.string,
        onChange: PropTypes.func,
        value: React.PropTypes.oneOfType([PropTypes.string, PropTypes.element]).isRequired,
        warningMessage: React.PropTypes.oneOfType([PropTypes.string, PropTypes.element])
    };

    render() {
        const {label, value, warningMessage, link, onChange} = this.props;

        let Action = null;

        if (link) {
            Action = (props) => <Link to={link} {...props} />;
        }

        if (onChange) {
            Action = (props) => <a onClick={onChange} {...props} href="#" />;
        }

        return (
            <div className={styles.paramItem}>
                <div className={styles.paramRow}>
                    <div className={styles.paramName}>{label}:</div>
                    <div className={styles.paramValue}>{value}</div>

                    {Action ? (
                        <Action to={link} className={styles.paramAction}>
                            <span className={styles.paramEditIcon} />
                        </Action>
                    ) : null}
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
