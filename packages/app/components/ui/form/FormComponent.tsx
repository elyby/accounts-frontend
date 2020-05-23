import React from 'react';
import { MessageDescriptor } from 'react-intl';
import i18n from 'app/services/i18n';

export default class FormComponent<P, S = {}> extends React.Component<P, S> {
  /**
   * Formats message resolving intl translations
   *
   * @param {string|object} message - message string, or intl message descriptor with an `id` field
   *
   * @returns {string}
   */
  formatMessage(message: string | MessageDescriptor): string {
    if (!message) {
      throw new Error('A message is required');
    }

    if (typeof message === 'string') {
      return message;
    }

    if (!message.id) {
      throw new Error(`Invalid message format: ${JSON.stringify(message)}`);
    }

    return i18n.getIntl().formatMessage(message);
  }

  /**
   * Focuses this field
   */
  focus() {}

  /**
   * A hook, that called, when the form was submitted with invalid data
   * This is useful for the cases, when some field needs to be refreshed e.g. captcha
   */
  onFormInvalid() {}
}
