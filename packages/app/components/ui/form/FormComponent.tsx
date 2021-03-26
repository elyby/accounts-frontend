import React, { ReactNode } from 'react';
import { MessageDescriptor } from 'react-intl';

import i18n from 'app/services/i18n';

function isMessageDescriptor(value: any): value is MessageDescriptor {
    return typeof value === 'object' && value.id;
}

export default class FormComponent<P, S = {}> extends React.Component<P, S> {
    /**
     * Formats message resolving intl translations
     *
     * @param {string|object} message - message string, or intl message descriptor with an `id` field
     *
     * @deprecated
     * @returns {string}
     */
    formatMessage<T extends ReactNode | MessageDescriptor>(message: T): T extends MessageDescriptor ? string : T {
        if (isMessageDescriptor(message)) {
            // @ts-ignore
            return i18n.getIntl().formatMessage(message);
        }

        // @ts-ignore
        return message;
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
