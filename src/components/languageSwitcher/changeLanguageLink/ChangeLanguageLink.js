// @flow
import React from 'react';
import classNames from 'classnames';
import { localeFlags } from 'components/i18n';
import LANGS from 'i18n/index.json';
import styles from './link.scss';

function LanguageLink({
    userLang,
    interfaceLocale,
    showLanguageSwitcherPopup,
}: {
    userLang: string;
    interfaceLocale: string;
    showLanguageSwitcherPopup: Function;
}) {
    const localeDefinition = LANGS[userLang] || LANGS[interfaceLocale];

    return (
        <span
            className={classNames(styles.languageLink, {
                [styles.mark]: userLang !== interfaceLocale,
            })}
            onClick={showLanguageSwitcherPopup}
        >
            <span className={styles.languageIcon} style={{
                backgroundImage: `url('${localeFlags.getIconUrl(localeDefinition.code)}')`,
            }} />
            {localeDefinition.name}
        </span>
    );
}

import { connect } from 'react-redux';
import { create as createPopup } from 'components/ui/popup/actions';
import LanguageSwitcher from 'components/languageSwitcher';

export default connect((state) => ({
    userLang: state.user.lang,
    interfaceLocale: state.i18n.locale,
}), {
    showLanguageSwitcherPopup: () => createPopup(LanguageSwitcher),
})(LanguageLink);
