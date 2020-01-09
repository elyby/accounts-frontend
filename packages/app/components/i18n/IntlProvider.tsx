import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { RawIntlProvider, IntlShape } from 'react-intl';
import i18n from 'app/services/i18n';
import { RootState } from 'app/reducers';

type Props = {
  children: React.ReactNode;
  locale: string;
};

function IntlProvider({ children, locale }: Props) {
  const [intl, setIntl] = useState<IntlShape>(i18n.getIntl());

  useEffect(() => {
    (async () => {
      setIntl(await i18n.changeLocale(locale));
    })();
  }, [locale]);

  return <RawIntlProvider value={intl}>{children}</RawIntlProvider>;
}

export default connect(({ i18n: i18nState }: RootState) => i18nState)(
  IntlProvider,
);
