import React, { ComponentType } from 'react';
import { Link } from 'react-router-dom';
import { FormattedMessage as Message } from 'react-intl';
import { Helmet } from 'react-helmet-async';
import { FooterMenu } from 'app/components/footerMenu';

import styles from './404.scss';
import profileStyles from '../profile/profile.scss';

const PageNotFound: ComponentType = () => (
    <div className={styles.page}>
        <Message key="title" defaultMessage="Page not found">
            {(pageTitle) => <Helmet title={pageTitle as string} />}
        </Message>

        <div className={styles.loading}>
            <div className={styles.cube} />
            <div className={styles.road} />
            <div className={styles.rocks}>
                <span className={styles.rockOne} />
                <span className={styles.rockTwo} />
                <span className={styles.rockThree} />
                <span className={styles.rockFour} />
                <span className={styles.rockFive} />
            </div>
            <div className={styles.clouds}>
                <span className={styles.cloudOne} />
                <span className={styles.cloudTwo} />
                <span className={styles.cloudThree} />
            </div>
        </div>
        <p className={styles.text}>
            <Message key="nothingHere" defaultMessage="This is not a place that you are looking for" />
        </p>
        <p className={styles.subText}>
            <Message
                key="returnToTheHomePage"
                defaultMessage="Try to go back to the {link}"
                values={{
                    link: (
                        <Link to="/">
                            <Message key="homePage" defaultMessage="main page" />
                        </Link>
                    ),
                }}
            />
        </p>

        <div className={profileStyles.footer}>
            <FooterMenu />
        </div>
    </div>
);

export default PageNotFound;
