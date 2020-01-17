import React, { ComponentType, ReactNode } from 'react';
import { localeFlags } from 'app/components/i18n';
import { FormattedMessage as Message } from 'react-intl';

import messages from './languageSwitcher.intl.json';
import styles from './languageSwitcher.scss';
import { LocaleData } from './LanguageSwitcher';

interface Props {
  locale: LocaleData;
}

const LocaleItem: ComponentType<Props> = ({
  locale: { code, name, englishName, progress, isReleased },
}) => {
  let progressLabel: ReactNode;

  if (progress !== 100) {
    progressLabel = (
      <Message
        {...messages.translationProgress}
        values={{
          progress,
        }}
      />
    );
  } else if (!isReleased) {
    progressLabel = <Message {...messages.mayBeInaccurate} />;
  }

  return (
    <div className={styles.languageFlex}>
      <div
        className={styles.languageIco}
        style={{
          backgroundImage: `url('${localeFlags.getIconUrl(code)}')`,
        }}
      />
      <div className={styles.languageCaptions}>
        <div className={styles.languageName}>{name}</div>
        <div className={styles.languageSubName}>
          {englishName} {progressLabel ? '| ' : ''} {progressLabel}
        </div>
      </div>
      <span className={styles.languageCircle} />
    </div>
  );
};

export default LocaleItem;
