import React, { useState, useEffect, ComponentType } from 'react';
import { useSelector } from 'react-redux';
import { RawIntlProvider, IntlShape } from 'react-intl';
import i18n from 'app/services/i18n';
import { RootState } from 'app/reducers';

const IntlProvider: ComponentType = ({ children }) => {
    const [intl, setIntl] = useState<IntlShape>();
    const locale = useSelector(({ i18n: i18nState }: RootState) => i18nState.locale);

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

    return <RawIntlProvider value={intl}>{children}</RawIntlProvider>;
};

export default IntlProvider;
