import React, { PropTypes } from 'react';

import FormComponent from './FormComponent';
import FormError from './FormError';

export default class FormInputComponent extends FormComponent {
    static displayName = 'FormInputComponent';

    static propTypes = {
        error: PropTypes.string
    };

    componentWillReceiveProps() {
        if (this.state && this.state.error) {
            Reflect.deleteProperty(this.state, 'error');

            this.setState(this.state);
        }
    }

    setEl = (el) => {
        this.el = el;
    };

    renderError() {
        const error = this.state && this.state.error || this.props.error;

        return <FormError error={error} />;
    }

    setError(error) {
        this.setState({error});
    }
}
