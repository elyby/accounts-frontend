import React, { Component } from 'react';

import { intlShape } from 'react-intl';

export default class FormComponent extends Component {
    static displayName = 'FormComponent';

    static contextTypes = {
        intl: intlShape.isRequired
    };

    formatMessage(message) {
        if (message && message.id && this.context && this.context.intl) {
            message = this.context.intl.formatMessage(message);
        }

        return message;
    }
}
