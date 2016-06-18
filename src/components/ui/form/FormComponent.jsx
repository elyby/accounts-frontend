import { Component } from 'react';

import { intlShape } from 'react-intl';

export default class FormComponent extends Component {
    static displayName = 'FormComponent';

    static contextTypes = {
        intl: intlShape.isRequired
    };

    /**
     * Formats message resolving intl translations
     *
     * @param {string|object} message - message string, or intl message descriptor with an `id` field
     *
     * @return {string}
     */
    formatMessage(message) {
        if (message && message.id && this.context && this.context.intl) {
            message = this.context.intl.formatMessage(message);
        }

        return message;
    }

    /**
     * Focuses this field
     */
    focus() {
    }
}
