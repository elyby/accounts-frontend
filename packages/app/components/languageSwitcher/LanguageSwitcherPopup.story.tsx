import React, { useState } from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import LanguageSwitcherPopup from './LanguageSwitcherPopup';

storiesOf('Components/Popups', module).add('LanguageSwitcherPopup', () => {
    const [activeLocale, setActiveLocale] = useState('en');

    return (
        <LanguageSwitcherPopup
            locales={{
                // Released and completely translated language
                be: {
                    code: 'be',
                    name: 'Беларуская',
                    englishName: 'Belarusian',
                    progress: 100,
                    isReleased: true,
                },
                // Not released, but completely translated language
                cs: {
                    code: 'cs',
                    name: 'Čeština',
                    englishName: 'Czech',
                    progress: 100,
                    isReleased: false,
                },
                // English (:
                en: {
                    code: 'en',
                    name: 'English',
                    englishName: 'English',
                    progress: 100,
                    isReleased: true,
                },
                // Released, but not completely translated language
                id: {
                    code: 'id',
                    name: 'Bahasa Indonesia',
                    englishName: 'Indonesian',
                    progress: 97,
                    isReleased: true,
                },
                // A few more languages just to create a scroll and to test some interesting characters
                pt: {
                    code: 'pt',
                    name: 'Português do Brasil',
                    englishName: 'Portuguese, Brazilian',
                    progress: 99,
                    isReleased: true,
                },
                vi: {
                    code: 'vi',
                    name: 'Tiếng Việt',
                    englishName: 'Vietnamese',
                    progress: 99,
                    isReleased: true,
                },
                zh: {
                    code: 'zh',
                    name: '简体中文',
                    englishName: 'Simplified Chinese',
                    progress: 99,
                    isReleased: true,
                },
            }}
            activeLocale={activeLocale}
            onSelect={(locale) => {
                action('onSelect')(locale);
                setActiveLocale(locale);
            }}
            onClose={action('onClose')}
        />
    );
});
