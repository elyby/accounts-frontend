import React from 'react';
import { useDispatch } from 'react-redux';
import { Channel } from '@storybook/channels';
import { setIntlConfig } from 'storybook-addon-intl';
import {
  EVENT_SET_LOCALE_ID,
  EVENT_GET_LOCALE_ID,
} from 'storybook-addon-intl/dist/shared';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from 'app/services/i18n';
import { setLocale } from 'app/components/i18n/actions';

setIntlConfig({
  locales: SUPPORTED_LANGUAGES,
  defaultLocale: DEFAULT_LANGUAGE,
});

const IntlDecorator: React.ComponentType<{
  channel: Channel;
}> = ({ channel, children }) => {
  const dispatch = useDispatch();

  React.useEffect(() => {
    const onLocaleChange = (locale: string) => {
      dispatch(setLocale(locale));
    };

    // Listen for change of locale
    channel.on(EVENT_SET_LOCALE_ID, onLocaleChange);

    // Request the current locale
    channel.emit(EVENT_GET_LOCALE_ID);

    return () => {
      channel.removeListener(EVENT_SET_LOCALE_ID, onLocaleChange);
    };
  }, [channel]);

  return children as React.ReactElement;
};

export default IntlDecorator;
