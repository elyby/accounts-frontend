// @flow
import React from 'react';
import classNames from 'classnames';
import { localeFlags } from 'components/i18n';
import LANGS from 'i18n/index.json';
import { connect } from 'react-redux';
import { create as createPopup } from 'components/ui/popup/actions';
import LanguageSwitcher from 'components/languageSwitcher';

import styles from './link.scss';

type OwnProps = {||};

type Props = {
  ...OwnProps,
  userLang: string,
  interfaceLocale: string,
  showLanguageSwitcherPopup: Function,
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

export default connect<Props, OwnProps, _, _, _, _>(
  state => ({
    userLang: state.user.lang,
    interfaceLocale: state.i18n.locale,
  }),
  {
    showLanguageSwitcherPopup: () => createPopup({ Popup: LanguageSwitcher }),
  },
)(LanguageLink);
