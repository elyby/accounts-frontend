import React, { PropTypes } from 'react';

import classNames from 'classnames';

import captcha from 'services/captcha';
import { skins, SKIN_DARK } from 'components/ui';
import { ComponentLoader } from 'components/ui/loader';

import styles from './form.scss';
import FormInputComponent from './FormInputComponent';

export default class Captcha extends FormInputComponent {
    static displayName = 'Captcha';

    static propTypes = {
        skin: PropTypes.oneOf(skins),
        delay: PropTypes.number
    };

    static defaultProps = {
        skin: SKIN_DARK,
        delay: 0
    };

    componentDidMount() {
        setTimeout(() =>
            captcha.render(this.el, {
                skin: this.props.skin,
                onSetCode: this.setCode
            })
            .then((captchaId) => this.captchaId = captchaId),
            this.props.delay
        );
    }

    render() {
        const {skin} = this.props;

        return (
            <div className={styles.captchaContainer}>
                <div className={styles.captchaLoader}>
                    <ComponentLoader />
                </div>

                <div ref={this.setEl} className={classNames(
                    styles.captcha,
                    styles[`${skin}Captcha`]
                )} />

                {this.renderError()}
            </div>
        );
    }

    reset() {
        captcha.reset(this.captchaId);
    }

    getValue() {
        return this.state && this.state.code;
    }

    onFormInvalid() {
        this.reset();
    }

    setCode = (code) => this.setState({code});
}
