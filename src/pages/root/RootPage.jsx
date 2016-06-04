import React, { PropTypes } from 'react';

import { FormattedMessage as Message } from 'react-intl';
import { Link } from 'react-router';
import classNames from 'classnames';

import Userbar from 'components/userbar/Userbar';
import PopupStack from 'components/ui/popup/PopupStack';

import styles from './root.scss';

import messages from './RootPage.intl.json';

function RootPage(props) {
    return (
        <div className={styles.root}>
            <div id="view-port" className={classNames(styles.viewPort, {
                [styles.isPopupActive]: props.isPopupActive
            })}>
                <div className={styles.header}>
                    <div className={styles.headerContent}>
                        <Link to="/" className={styles.logo}>
                            <Message {...messages.siteName} />
                        </Link>
                        <div className={styles.userbar}>
                            <Userbar {...props} onLogout={props.logout} />
                        </div>
                    </div>
                </div>
                <div className={styles.body}>
                    {props.children}
                </div>
            </div>
            <PopupStack />
        </div>
    );
}

RootPage.displayName = 'RootPage';
RootPage.propTypes = {
    children: PropTypes.element,
    logout: PropTypes.func.isRequired,
    isPopupActive: PropTypes.bool
};

import { connect } from 'react-redux';
import { logout } from 'components/user/actions';

export default connect((state) => ({
    user: state.user,
    isPopupActive: state.popup.popups.length > 0
}), {
    logout
})(RootPage);
