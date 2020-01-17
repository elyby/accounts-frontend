import React, { ComponentType, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import clsx from 'clsx';
import { localeFlags } from 'app/components/i18n';
import LANGS from 'app/i18n';
import { create as createPopup } from 'app/components/ui/popup/actions';
import LanguageSwitcher from 'app/components/languageSwitcher';
import { RootState } from 'app/reducers';

import styles from './link.scss';

const LanguageLink: ComponentType = () => {
  const dispatch = useDispatch();
  const showLanguageSwitcherPopup = useCallback(() => {
    dispatch(createPopup({ Popup: LanguageSwitcher }));
  }, [dispatch]);

  const userLang = useSelector((state: RootState) => state.user.lang);
  const interfaceLocale = useSelector((state: RootState) => state.i18n.locale);

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
          backgroundImage: `url('${localeFlags.getIconUrl(
            localeDefinition.code,
          )}')`,
        }}
      />
      {localeDefinition.name}
    </span>
  );
};

export default LanguageLink;
