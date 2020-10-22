import React, { InputHTMLAttributes, MouseEventHandler } from 'react';
import { MessageDescriptor } from 'react-intl';
import ClickAwayListener from 'react-click-away-listener';
import clsx from 'clsx';

import { COLOR_GREEN, Color } from 'app/components/ui';

import styles from './dropdown.scss';
import FormInputComponent from './FormInputComponent';

type I18nString = string | MessageDescriptor;
type ItemLabel = I18nString | React.ReactElement;

interface Props extends InputHTMLAttributes<HTMLInputElement> {
    label: I18nString;
    items: Record<string, ItemLabel>;
    block?: boolean;
    color: Color;
}

interface OptionItem {
    label: ItemLabel;
    value: string;
}

interface State {
    isActive: boolean;
    activeItem: OptionItem | null;
}

export default class Dropdown extends FormInputComponent<Props, State> {
    static defaultProps: Partial<Props> = {
        color: COLOR_GREEN,
    };

    state: State = {
        isActive: false,
        activeItem: null,
    };

    render() {
        const { color, block, items, ...restProps } = this.props;
        const { isActive } = this.state;

        delete restProps.label;

        const activeItem = this.getActiveItem();
        const label = React.isValidElement(activeItem.label) ? activeItem.label : this.formatMessage(activeItem.label);

        return (
            <ClickAwayListener onClickAway={this.onCloseClick}>
                <div
                    className={clsx(styles[color], {
                        [styles.block]: block,
                        [styles.opened]: isActive,
                    })}
                    data-e2e-select-name={restProps.name}
                    {...restProps}
                    onClick={this.onToggle}
                >
                    <span className={styles.label} data-testid="select-label">
                        {label}
                    </span>
                    <span className={styles.toggleIcon} />

                    <div className={styles.menu}>
                        {Object.entries(items).map(([value, label]) => (
                            <div className={styles.menuItem} key={value} onClick={this.onSelectItem({ value, label })}>
                                {label}
                            </div>
                        ))}
                    </div>
                </div>

                {this.renderError()}
            </ClickAwayListener>
        );
    }

    toggle() {
        this.setState({
            isActive: !this.state.isActive,
        });
    }

    onSelectItem(item: OptionItem): MouseEventHandler<HTMLDivElement> {
        return (event) => {
            event.preventDefault();

            this.setState({
                activeItem: item,
            });
        };
    }

    getActiveItem(): OptionItem {
        const { items } = this.props;
        let { activeItem } = this.state;

        if (!activeItem) {
            activeItem = {
                label: this.props.label,
                value: '',
            };

            if (!activeItem.label) {
                const [[value, label]] = Object.entries(items);

                activeItem = {
                    label,
                    value,
                };
            }
        }

        return activeItem;
    }

    getValue() {
        return this.getActiveItem()?.value;
    }

    onToggle = (event: React.MouseEvent<HTMLDivElement>) => {
        event.preventDefault();

        this.toggle();
    };

    onCloseClick = () => {
        if (this.state.isActive) {
            this.toggle();
        }
    };
}
