import React, { ChangeEventHandler, ComponentType, KeyboardEventHandler, useCallback, useState } from 'react';
import { FormattedMessage as Message, useIntl } from 'react-intl';
import clsx from 'clsx';

import formStyles from 'app/components/ui/form/form.scss';
import Popup from 'app/components/ui/popup';

import styles from './languageSwitcher.scss';
import LanguagesList from './LanguagesList';

const translateUrl = 'https://crowdin.com/project/elyby';

export interface LocaleData {
    code: string;
    name: string;
    englishName: string;
    progress: number;
    isReleased: boolean;
}

export type LocalesMap = Record<string, LocaleData>;

interface Props {
    locales: LocalesMap;
    activeLocale: string;
    onSelect?: (lang: string) => void;
    onClose?: () => void;
}

const LanguageSwitcherPopup: ComponentType<Props> = ({ locales, activeLocale, onSelect, onClose }) => {
    const intl = useIntl();

    const [filter, setFilter] = useState<string>('');
    const filteredLocales = Object.keys(locales).reduce((acc, key) => {
        if (
            locales[key].englishName.toLowerCase().includes(filter) ||
            locales[key].name.toLowerCase().includes(filter)
        ) {
            acc[key] = locales[key];
        }

        return acc;
    }, {} as typeof locales);

    const onFilterChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
        (event) => {
            setFilter(event.currentTarget.value.trim().toLowerCase());
        },
        [setFilter],
    );
    const onFilterKeyPress = useCallback<KeyboardEventHandler<HTMLInputElement>>(
        (event) => {
            if (event.key !== 'Enter' || filter === '') {
                return;
            }

            const localesKeys = Object.keys(filteredLocales);

            if (localesKeys.length === 0) {
                return;
            }

            onSelect && onSelect(localesKeys[0]);
        },
        [filter, filteredLocales, onSelect],
    );

    return (
        <Popup
            title={<Message key="siteLanguage" defaultMessage="Site language" />}
            wrapperClassName={styles.boundings}
            bodyClassName={styles.body}
            onClose={onClose}
            data-testid="language-switcher"
            data-e2e-active-locale={activeLocale}
        >
            <div className={styles.searchBox}>
                <input
                    className={clsx(formStyles.lightTextField, formStyles.greenTextField)}
                    placeholder={intl.formatMessage({
                        key: 'startTyping',
                        defaultMessage: 'Start typing…',
                    })}
                    onChange={onFilterChange}
                    onKeyPress={onFilterKeyPress}
                    autoFocus
                />
                <span className={styles.searchIcon} />
            </div>

            <LanguagesList selectedLocale={activeLocale} locales={filteredLocales} onChangeLang={onSelect} />

            <div className={styles.improveTranslates}>
                <div className={styles.improveTranslatesIcon} />
                <div className={styles.improveTranslatesContent}>
                    <div className={styles.improveTranslatesTitle}>
                        <Message key="improveTranslates" defaultMessage="Improve Ely.by translation" />
                    </div>
                    <div className={styles.improveTranslatesText}>
                        <Message
                            key="improveTranslatesDescription"
                            defaultMessage="Ely.by’s localization is a community effort. If you want to improve the translation of Ely.by, we'd love your help."
                        />{' '}
                        <a href={translateUrl} target="_blank">
                            <Message key="improveTranslatesParticipate" defaultMessage="Click here to participate." />
                        </a>
                    </div>
                </div>
            </div>
        </Popup>
    );
};

export default LanguageSwitcherPopup;
