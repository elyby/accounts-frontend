import React, { PropTypes } from 'react';

import { connect } from 'react-redux';
import { Link } from 'react-router';

import Userbar from 'components/userbar/Userbar';

import styles from './root.scss';

function RootPage(props) {
    return (
        <div className={styles.root}>
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <Link to="/" className={styles.logo}>
                        Ely.by
                    </Link>
                    <div className={styles.userbar}>
                        <Userbar {...props} />
                    </div>
                </div>
            </div>
            <div className={styles.body}>
                {props.children}
            </div>
        </div>
    );
}

RootPage.displayName = 'RootPage';
RootPage.propTypes = {
    children: PropTypes.element
};

export default connect((state) => ({
    user: state.user
}))(RootPage);
