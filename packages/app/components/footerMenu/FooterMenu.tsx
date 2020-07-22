import React, { ComponentType, MouseEventHandler, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FormattedMessage as Message } from 'react-intl';

import { useReduxDispatch } from 'app/functions';
import LanguageSwitcher from 'app/components/languageSwitcher';
import SourceCode from 'app/components/sourceCode';
import { create as createPopup } from 'app/components/ui/popup/actions';
import { ContactLink } from 'app/components/contact';

import styles from './footerMenu.scss';

const FooterMenu: ComponentType = () => {
    const dispatch = useReduxDispatch();

    const createPopupHandler = useCallback(
        (popup: ComponentType): MouseEventHandler<HTMLAnchorElement> => (event) => {
            event.preventDefault();
            dispatch(createPopup({ Popup: popup }));
        },
        [dispatch],
    );

    return (
        <div className={styles.footerMenu} data-testid="footer">
            <div className={styles.row}>
                <Link to="/rules" className={styles.footerItem}>
                    <Message key="rules" defaultMessage="Rules" />
                </Link>

                {'ꞏ'}

                <ContactLink className={styles.footerItem}>
                    <Message key="contactUs" defaultMessage="Contact Us" />
                </ContactLink>
            </div>

            <div className={styles.row}>
                <Link to="/dev" className={styles.footerItem}>
                    <Message key="forDevelopers" defaultMessage="For developers" />
                </Link>

                {'ꞏ'}

                <a href="#" className={styles.footerItem} onClick={createPopupHandler(SourceCode)}>
                    <Message key="sourceCode" defaultMessage="Source code" />
                </a>
            </div>

            <div className={styles.row}>
                <a href="#" className={styles.footerItem} onClick={createPopupHandler(LanguageSwitcher)}>
                    <span className={styles.langTriggerIcon} />
                    <Message key="siteLanguage" defaultMessage="Site language" />
                </a>
            </div>
        </div>
    );
};

export default FooterMenu;
