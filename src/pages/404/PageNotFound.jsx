import React from 'react';

import { FooterMenu } from 'components/footerMenu';

import { Link } from 'react-router-dom';
import { FormattedMessage as Message } from 'react-intl';
import Helmet from 'react-helmet';

import styles from './404.scss';
import messages from './PageNotFound.intl.json';

import profileStyles from 'pages/profile/profile.scss';

export default function PageNotFound() {
    return (
        <div className={styles.page}>
            <Message {...messages.title}>
                {(pageTitle) => (
                    <Helmet title={pageTitle} />
                )}
            </Message>

            <div className={styles.loading}>
                <div className={styles.cube}/>
                <div className={styles.road}/>
                <div className={styles.rocks}>
                    <span className={styles.rockOne}/>
                    <span className={styles.rockTwo}/>
                    <span className={styles.rockThree}/>
                    <span className={styles.rockFour}/>
                    <span className={styles.rockFive}/>
                </div>
                <div className={styles.clouds}>
                    <span className={styles.cloudOne}/>
                    <span className={styles.cloudTwo}/>
                    <span className={styles.cloudThree}/>
                </div>
            </div>
            <p className={styles.text}>
                <Message {...messages.nothingHere} />
            </p>
            <p className={styles.subText}>
                <Message {...messages.returnToTheHomePage} values={{
                    link: (
                        <Link to="/">
                            <Message {...messages.homePage} />
                        </Link>
                    )
                }} />
            </p>

            <div className={profileStyles.footer}>
                <FooterMenu />
            </div>
        </div>
    );
}
