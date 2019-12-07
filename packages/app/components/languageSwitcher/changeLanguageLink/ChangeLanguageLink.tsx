import React from 'react';
import classNames from 'classnames';
import { localeFlags } from 'app/components/i18n';
import LANGS from 'app/i18n';
import { connect } from 'react-redux';
import { create as createPopup } from 'app/components/ui/popup/actions';
import LanguageSwitcher from 'app/components/languageSwitcher';
import { RootState } from 'app/reducers';

import styles from './link.scss';

type Props = {
  userLang: string;
  interfaceLocale: string;
  showLanguageSwitcherPopup: (event: React.MouseEvent<HTMLSpanElement>) => void;
};

function LanguageLink({
  userLang,
  interfaceLocale,
  showLanguageSwitcherPopup,
}: Props) {
  const localeDefinition = LANGS[userLang] || LANGS[interfaceLocale];

  return (
    <span
      className={classNames(styles.languageLink, {
        [styles.mark]: userLang !== interfaceLocale,
      })}
      onClick={showLanguageSwitcherPopup}
    >
      <span
        className={styles.languageIcon}
        style={{
          backgroundImage: `url('${localeFlags.getIconUrl(
            localeDefinition.code,
          )}')`,
        }}
      />
      {localeDefinition.name}
    </span>
  );
}

export default connect(
  (state: RootState) => ({
    userLang: state.user.lang,
    interfaceLocale: state.i18n.locale,
  }),
  {
    showLanguageSwitcherPopup: () => createPopup({ Popup: LanguageSwitcher }),
  },
)(LanguageLink);
