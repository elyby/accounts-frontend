import React, { InputHTMLAttributes, MouseEventHandler } from 'react';
import ReactDOM from 'react-dom';
import { MessageDescriptor } from 'react-intl';
import clsx from 'clsx';
import { COLOR_GREEN, Color } from 'app/components/ui';

import styles from './dropdown.scss';
import FormInputComponent from './FormInputComponent';

type I18nString = string | MessageDescriptor;
type ItemLabel = I18nString | React.ReactElement;

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: I18nString;
  items: { [value: string]: ItemLabel };
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

  componentDidMount() {
    // listen to capturing phase to ensure, that our event handler will be
    // called before all other
    // @ts-ignore
    document.addEventListener('click', this.onBodyClick, true);
  }

  componentWillUnmount() {
    // @ts-ignore
    document.removeEventListener('click', this.onBodyClick);
  }

  render() {
    const { color, block, items, ...restProps } = this.props;
    const { isActive } = this.state;

    delete restProps.label;

    const activeItem = this.getActiveItem();
    const label = React.isValidElement(activeItem.label)
      ? activeItem.label
      : this.formatMessage(activeItem.label);

    return (
      <div>
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
              <div
                className={styles.menuItem}
                key={value}
                onClick={this.onSelectItem({ value, label })}
              >
                {label}
              </div>
            ))}
          </div>
        </div>

        {this.renderError()}
      </div>
    );
  }

  toggle() {
    this.setState({
      isActive: !this.state.isActive,
    });
  }

  onSelectItem(item: OptionItem): MouseEventHandler {
    return event => {
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

  onBodyClick: MouseEventHandler = event => {
    if (this.state.isActive) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const el = ReactDOM.findDOMNode(this)!;

      if (!el.contains(event.target as HTMLElement) && el !== event.target) {
        event.preventDefault();
        event.stopPropagation();

        this.toggle();
      }
    }
  };
}
