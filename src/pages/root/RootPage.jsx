import React, { PropTypes } from 'react';

import { FormattedMessage as Message } from 'react-intl';
import { Link } from 'react-router';
import classNames from 'classnames';

import Userbar from 'components/userbar/Userbar';
import PopupStack from 'components/ui/popup/PopupStack';
import DevTools from 'containers/DevTools';

import styles from './root.scss';

import messages from './RootPage.intl.json';

function RootPage(props) {
    const isRegisterPage = props.location.pathname === '/register';

    /* global process: false */
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
                            <Userbar {...props}
                                onLogout={props.logout}
                                guestAction={isRegisterPage ? 'login' : 'register'}
                            />
                        </div>
                    </div>
                </div>
                <div className={styles.body}>
                    {props.children}
                </div>
            </div>
            <PopupStack />
            {process.env.NODE_ENV === 'production' ? null : <DevTools /> }
        </div>
    );
}

RootPage.displayName = 'RootPage';
RootPage.propTypes = {
    location: PropTypes.shape({
        pathname: PropTypes.string
    }).isRequired,
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
