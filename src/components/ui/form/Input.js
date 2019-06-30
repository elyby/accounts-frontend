// @flow
import type { Skin, Color } from 'components/ui';
import type { MessageDescriptor } from 'react-intl';
import React from 'react';
import classNames from 'classnames';
import { uniqueId, omit } from 'functions';
import copy from 'services/copy';
import icons from 'components/ui/icons.scss';
import { SKIN_DARK, COLOR_GREEN } from 'components/ui';

import styles from './form.scss';
import FormInputComponent from './FormInputComponent';

let copiedStateTimeout: TimeoutID;

export default class Input extends FormInputComponent<{
    skin: Skin,
    color: Color,
    center: bool,
    disabled: bool,
    label?: string | MessageDescriptor,
    placeholder?: string | MessageDescriptor,
    error?: string | {type: string, payload: string},
    icon?: string,
    copy?: bool,
}, {
    wasCopied: bool,
}> {
    static defaultProps = {
        color: COLOR_GREEN,
        skin: SKIN_DARK,
        center: false,
        disabled: false,
    };

    state = {
        wasCopied: false,
    };

    elRef = React.createRef<HTMLInputElement>();

    render() {
        const { color, skin, center } = this.props;
        let { icon, label, copy } = this.props;
        const { wasCopied } = this.state;

        const props = omit({
            type: 'text',
            ...this.props,
        }, ['label', 'error', 'skin', 'color', 'center', 'icon', 'copy']);

        if (label) {
            if (!props.id) {
                props.id = uniqueId('input');
            }

            label = this.formatMessage(label);

            label = (
                <label className={styles.textFieldLabel} htmlFor={props.id}>
                    {label}
                </label>
            );
        }

        props.placeholder = this.formatMessage(props.placeholder);

        let baseClass = styles.formRow;

        if (icon) {
            baseClass = styles.formIconRow;
            icon = (
                <span className={classNames(styles.textFieldIcon, icons[icon])} />
            );
        }

        if (copy) {
            copy = (
                <div
                    className={classNames(styles.copyIcon, {
                        [icons.clipboard]: !wasCopied,
                        [icons.checkmark]: wasCopied,
                        [styles.copyCheckmark]: wasCopied,
                    })}
                    onClick={this.onCopy}
                />
            );
        }

        return (
            <div className={baseClass}>
                {label}
                <div className={styles.textFieldContainer}>
                    <input ref={this.elRef}
                        className={classNames(
                            styles[`${skin}TextField`],
                            styles[`${color}TextField`],
                            {
                                [styles.textFieldCenter]: center
                            }
                        )}
                        {...props}
                    />
                    {icon}
                    {copy}
                </div>
                {this.renderError()}
            </div>
        );
    }

    getValue() {
        const { current: el } = this.elRef;

        return el && el.value;
    }

    focus() {
        const { current: el } = this.elRef;

        if (!el) {
            return;
        }

        el.focus();
        setTimeout(el.focus.bind(el), 10);
    }

    onCopy = async () => {
        const value = this.getValue();

        if (!value) {
            return;
        }

        try {
            clearTimeout(copiedStateTimeout);
            await copy(value);
            this.setState({wasCopied: true});
            copiedStateTimeout = setTimeout(() => this.setState({wasCopied: false}), 2000);
        } catch (err) {
            // it's okay
        }
    };
}
