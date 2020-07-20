import React, { ComponentType, ReactNode } from 'react';
import { getLocaleIconUrl } from 'app/components/i18n';
import { FormattedMessage as Message } from 'react-intl';

import styles from './languageSwitcher.scss';
import { LocaleData } from './LanguageSwitcherPopup';

interface Props {
    locale: LocaleData;
}

const LocaleItem: ComponentType<Props> = ({ locale: { code, name, englishName, progress, isReleased } }) => {
    let progressLabel: ReactNode;

    if (progress !== 100) {
        progressLabel = (
            <Message
                key="translationProgress"
                defaultMessage="{progress}% translated"
                values={{
                    progress,
                }}
            />
        );
    } else if (!isReleased) {
        progressLabel = <Message key="mayBeInaccurate" defaultMessage="May be inaccurate" />;
    }

    return (
        <div className={styles.languageFlex}>
            <div
                className={styles.languageIco}
                style={{
                    backgroundImage: `url('${getLocaleIconUrl(code)}')`,
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
