import React, { useState, useEffect, ComponentType } from 'react';
import { RawIntlProvider, IntlShape } from 'react-intl';
import { Helmet } from 'react-helmet-async';

import { getLangDir } from 'rtl-detect';

import i18n from 'app/services/i18n';
import { useReduxSelector } from 'app/functions';

const IntlProvider: ComponentType = ({ children }) => {
    const [intl, setIntl] = useState<IntlShape>();
    const locale = useReduxSelector(({ i18n: i18nState }) => i18nState.locale);

    useEffect(() => {
        if (process.env.NODE_ENV === 'test') {
            // disable async modules loading in tests
            setIntl(i18n.getIntl());

            return;
        }

        (async () => {
            setIntl(await i18n.changeLocale(locale));
        })();
    }, [locale]);

    // don't run the application until locale bundle will be loaded
    if (!intl) {
        return null;
    }

    return (
        <RawIntlProvider value={intl}>
            <Helmet htmlAttributes={{ lang: locale, dir: getLangDir(locale) }} />
            {children}
        </RawIntlProvider>
    );
};

export default IntlProvider;
