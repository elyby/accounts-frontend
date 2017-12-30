// @flow
import React from 'react';

import { localeFlags } from 'components/i18n';
import { FormattedMessage as Message } from 'react-intl';
import messages from './languageSwitcher.intl.json';
import styles from './languageSwitcher.scss';
import type { LocaleData } from './LanguageSwitcher';

export default function LocaleItem({
    locale,
}: {
    locale: LocaleData,
}) {
    const {code, name, englishName, progress, isReleased} = locale;

    let progressLabel;

    if (progress !== 100) {
        progressLabel = (
            <Message {...messages.translationProgress} values={{
                progress,
            }} />
        );
    } else if (!isReleased) {
        progressLabel = (
            <Message {...messages.mayBeInaccurate} />
        );
    }

    return (
        <div className={styles.languageFlex}>
            <div className={styles.languageIco} style={{
                backgroundImage: `url('${localeFlags.getIconUrl(code)}')`,
            }} />
            <div className={styles.languageCaptions}>
                <div className={styles.languageName}>
                    {name}
                </div>
                <div className={styles.languageSubName}>
                    {englishName} {progressLabel ? '| ' : ''} {progressLabel}
                </div>
            </div>
            <span className={styles.languageCircle} />
        </div>
    );
}
