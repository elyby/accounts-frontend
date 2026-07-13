import React from 'react';

import { setLocale } from 'app/components/i18n/actions';
import { useReduxDispatch } from 'app/functions';

interface Props {
    locale: string;
    children: React.ReactNode;
}

const IntlDecorator: React.ComponentType<Props> = ({ locale, children }) => {
    const dispatch = useReduxDispatch();

    React.useEffect(() => {
        dispatch(setLocale(locale));
    }, [dispatch, locale]);

    return children as React.ReactElement;
};

export default IntlDecorator;
