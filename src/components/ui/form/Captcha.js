// @flow
import React from 'react';
import classNames from 'classnames';
import type { CaptchaID } from 'services/captcha';
import type { Skin } from 'components/ui';
import captcha from 'services/captcha';
import logger from 'services/logger';
import { ComponentLoader } from 'components/ui/loader';

import styles from './form.scss';
import FormInputComponent from './FormInputComponent';

export default class Captcha extends FormInputComponent<
  {
    delay: number,
    skin: Skin,
  },
  {
    code: string,
  },
> {
  elRef = React.createRef<HTMLDivElement>();
  captchaId: CaptchaID;

  static defaultProps = {
    skin: 'dark',
    delay: 0,
  };

  componentDidMount() {
    setTimeout(() => {
      const { current: el } = this.elRef;

      el &&
        captcha
          .render(el, {
            skin: this.props.skin,
            onSetCode: this.setCode,
          })
          .then(captchaId => {
            this.captchaId = captchaId;
          })
          .catch(error => {
            logger.error('Failed rendering captcha', {
              error,
            });
          });
    }, this.props.delay);
  }

  render() {
    const { skin } = this.props;

    return (
      <div className={styles.captchaContainer}>
        <div className={styles.captchaLoader}>
          <ComponentLoader />
        </div>

        <div
          ref={this.elRef}
          className={classNames(styles.captcha, styles[`${skin}Captcha`])}
        />

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

  setCode = (code: string) => this.setState({ code });
}
