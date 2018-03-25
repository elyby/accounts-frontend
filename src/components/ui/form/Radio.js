// @flow
import React from 'react';

import classNames from 'classnames';

import { SKIN_DARK, COLOR_GREEN } from 'components/ui';
import { omit } from 'functions';

import styles from './form.scss';
import FormInputComponent from './FormInputComponent';

import type { Color, Skin } from 'components/ui';
import type { MessageDescriptor } from 'react-intl';

export default class Radio extends FormInputComponent<{
    color: Color,
    skin: Skin,
    label: string | MessageDescriptor,
}> {
    static displayName = 'Radio';

    static defaultProps = {
        color: COLOR_GREEN,
        skin: SKIN_DARK,
    };

    render() {
        const { color, skin } = this.props;
        let { label } = this.props;

        label = this.formatMessage(label);

        const props = omit(this.props, ['color', 'skin', 'label']);

        return (
            <div className={classNames(styles[`${color}MarkableRow`], styles[`${skin}MarkableRow`])}>
                <label className={styles.markableContainer}>
                    <input ref={this.setEl}
                        className={styles.markableInput}
                        type="radio"
                        {...props}
                    />
                    <div className={styles.radio} />
                    {label}
                </label>
                {this.renderError()}
            </div>
        );
    }

    getValue() {
        return this.el.checked ? 1 : 0;
    }

    focus() {
        this.el.focus();
    }
}
