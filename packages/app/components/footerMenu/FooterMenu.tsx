import React, { ComponentType, MouseEventHandler, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { FormattedMessage as Message } from 'react-intl';
import LanguageSwitcher from 'app/components/languageSwitcher';
import { create as createPopup } from 'app/components/ui/popup/actions';
import { ContactLink } from 'app/components/contact';

import styles from './footerMenu.scss';

const FooterMenu: ComponentType = () => {
    const dispatch = useDispatch();
    const onLanguageSwitcherClick = useCallback<MouseEventHandler<HTMLAnchorElement>>(
        (event) => {
            event.preventDefault();
            dispatch(createPopup({ Popup: LanguageSwitcher }));
        },
        [dispatch],
    );

    return (
        <div className={styles.footerMenu} data-testid="footer">
            <Link to="/rules" className={styles.footerItem}>
                <Message key="rules" defaultMessage="Rules" />
            </Link>
            <ContactLink className={styles.footerItem}>
                <Message key="contactUs" defaultMessage="Contact Us" />
            </ContactLink>
            <Link to="/dev" className={styles.footerItem}>
                <Message key="forDevelopers" defaultMessage="For developers" />
            </Link>

            <div className={styles.langTriggerContainer}>
                <a href="#" className={styles.langTrigger} onClick={onLanguageSwitcherClick}>
                    <span className={styles.langTriggerIcon} />
                    <Message key="siteLanguage" defaultMessage="Site language" />
                </a>
            </div>
        </div>
    );
};

export default FooterMenu;
