import React, { useState, useEffect, ComponentType } from 'react';
import { useSelector } from 'react-redux';
import { RawIntlProvider, IntlShape } from 'react-intl';
import i18n from 'app/services/i18n';
import { RootState } from 'app/reducers';

const IntlProvider: ComponentType = ({ children }) => {
  const [intl, setIntl] = useState<IntlShape>(i18n.getIntl());
  const locale = useSelector(
    ({ i18n: i18nState }: RootState) => i18nState.locale,
  );

  useEffect(() => {
    (async () => {
      setIntl(await i18n.changeLocale(locale));
    })();
  }, [locale]);

  return <RawIntlProvider value={intl}>{children}</RawIntlProvider>;
};

export default IntlProvider;
