import React, { PropTypes } from 'react';

import errorsDict from 'services/errorsDict';

import styles from './form.scss';
import FormComponent from './FormComponent';

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

        if (error) {
            return (
                <div className={styles.fieldError}>
                    {errorsDict.resolve(error)}
                </div>
            );
        }

        return null;
    }

    setError(error) {
        this.setState({error});
    }
}
