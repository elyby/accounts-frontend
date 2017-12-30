// @flow
import React from 'react';
import { connect } from 'react-redux';
import { create as createPopup } from 'components/ui/popup/actions';
import { localeFlags } from 'components/i18n';
import LANGS from 'i18n/index.json';
import LanguageSwitcher from '../LanguageSwitcher';
import styles from './link.scss';

function LanguageLink({
    userLang,
    showLanguageSwitcherPopup,
}: {
    userLang: string,
    showLanguageSwitcherPopup: Function,
}) {
    return (
        <span className={styles.languageLink} onClick={showLanguageSwitcherPopup}>
            <span className={styles.languageIcon} style={{
                backgroundImage: `url('${localeFlags.getIconUrl(userLang)}')`
            }} />
            {LANGS[userLang].name}
        </span>
    );
}

export default connect((state) => ({
    userLang: state.user.lang,
}), {
    showLanguageSwitcherPopup: () => createPopup(LanguageSwitcher),
})(LanguageLink);
