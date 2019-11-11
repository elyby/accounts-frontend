// @flow
import type { Node } from 'react';
import type { IntlShape } from 'react-intl';
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { RawIntlProvider } from 'react-intl';
import i18n from 'services/i18n';

type OwnProps = {|
  children: Node
|};

type Props = {
  ...OwnProps,
  locale: string
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

export default connect<Props, OwnProps, _, _, _, _>(({ i18n }) => i18n)(
    IntlProvider
);
