import type { Preview } from '@storybook/react';

import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from 'app/services/i18n';

import storyDecorator from './storyDecorator';

function getLanguageTitle(locale: string): string {
    try {
        return new Intl.DisplayNames(['en'], { type: 'language' }).of(locale) ?? locale;
    } catch {
        return locale;
    }
}

const preview: Preview = {
    decorators: [storyDecorator],
    globalTypes: {
        locale: {
            name: 'Locale',
            description: 'Application locale (react-intl)',
            defaultValue: DEFAULT_LANGUAGE,
            toolbar: {
                icon: 'globe',
                dynamicTitle: true,
                items: SUPPORTED_LANGUAGES.map((locale) => ({
                    value: locale,
                    title: getLanguageTitle(locale),
                })),
            },
        },
    },
};

export default preview;
