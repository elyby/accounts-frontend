import React, { ComponentType, useCallback } from 'react';
import clsx from 'clsx';

import { useReduxDispatch, useReduxSelector } from 'app/functions';
import { getLocaleIconUrl } from 'app/components/i18n';
import LANGS from 'app/i18n';
import { create as createPopup } from 'app/components/ui/popup/actions';
import LanguageSwitcher from 'app/components/languageSwitcher';

import styles from './link.scss';

const LanguageLink: ComponentType = () => {
    const dispatch = useReduxDispatch();
    const showLanguageSwitcherPopup = useCallback(() => {
        dispatch(createPopup({ Popup: LanguageSwitcher }));
    }, [dispatch]);

    const userLang = useReduxSelector((state) => state.user.lang);
    const interfaceLocale = useReduxSelector((state) => state.i18n.locale);

    const localeDefinition = LANGS[userLang] || LANGS[interfaceLocale];

    return (
        <span
            className={clsx(styles.languageLink, {
                [styles.mark]: userLang !== interfaceLocale,
            })}
            onClick={showLanguageSwitcherPopup}
        >
            <span
                className={styles.languageIcon}
                style={{
                    backgroundImage: `url('${getLocaleIconUrl(localeDefinition.code)}')`,
                }}
            />
            {localeDefinition.name}
        </span>
    );
};

export default LanguageLink;
