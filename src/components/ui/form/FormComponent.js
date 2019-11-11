// @flow
import type { MessageDescriptor } from 'react-intl';
import type { Element } from 'react';
import { Component } from 'react';
import i18n from 'services/i18n';

class FormComponent<P, S = void> extends Component<P, S> {
    /**
     * Formats message resolving intl translations
     *
     * @param {string|object} message - message string, or intl message descriptor with an `id` field
     *
     * @return {string}
     */
    formatMessage(message: string | MessageDescriptor | Element<any>): string | Element<any> {
        if (typeof message === 'string') {
            return message;
        }

        if (message && message.id) {
            return i18n.getIntl().formatMessage(message);
        }

        return ((message: any): Element<any>);
    }

    /**
     * Focuses this field
     */
    focus() {
    }

    /**
     * A hook, that called, when the form was submitted with invalid data
     * This is usefull for the cases, when some field needs to be refreshed e.g. captcha
     */
    onFormInvalid() {
    }
}

export default FormComponent;
