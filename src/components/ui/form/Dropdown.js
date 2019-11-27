import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';

import classNames from 'classnames';

import { omit } from 'functions';
import { colors, COLOR_GREEN } from 'components/ui';

import styles from './dropdown.scss';
import FormInputComponent from './FormInputComponent';

export default class Dropdown extends FormInputComponent {
  static displayName = 'Dropdown';

  static propTypes = {
    label: PropTypes.oneOfType([
      PropTypes.shape({
        id: PropTypes.string,
      }),
      PropTypes.string,
    ]).isRequired,
    items: PropTypes.arrayOf(
      PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
          id: PropTypes.string,
        }),
      ]),
    ).isRequired,
    block: PropTypes.bool,
    color: PropTypes.oneOf(colors),
  };

  static defaultProps = {
    color: COLOR_GREEN,
  };

  state = {
    isActive: false,
    activeItem: null,
  };

  componentDidMount() {
    // listen to capturing phase to ensure, that our event handler will be
    // called before all other
    document.addEventListener('click', this.onBodyClick, true);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.onBodyClick);
  }

  render() {
    const { color, block, items } = this.props;
    const { isActive } = this.state;

    const activeItem = this.getActiveItem();
    const label = this.formatMessage(activeItem.label);
    const props = omit(this.props, Object.keys(Dropdown.propTypes));

    return (
      <div>
        <div
          className={classNames(styles[color], {
            [styles.block]: block,
            [styles.opened]: isActive,
          })}
          {...props}
          onClick={this.onToggle}
        >
          <span className={styles.label}>{label}</span>
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

  onSelectItem(item) {
    return event => {
      event.preventDefault();

      this.setState({
        activeItem: item,
      });
    };
  }

  getActiveItem() {
    const { items } = this.props;
    let { activeItem } = this.state;

    if (!activeItem) {
      activeItem = {
        label: this.props.label,
        value: '',
      };

      if (!activeItem.label) {
        const firstItem = Object.entries(items)[0];
        activeItem = {
          label: firstItem[1],
          value: firstItem[0],
        };
      }
    }

    return activeItem;
  }

  getValue() {
    return this.getActiveItem().value;
  }

  onToggle = event => {
    event.preventDefault();

    this.toggle();
  };

  onBodyClick = event => {
    if (this.state.isActive) {
      const el = ReactDOM.findDOMNode(this);

      if (!el.contains(event.target) && el !== event.taget) {
        event.preventDefault();
        event.stopPropagation();

        this.toggle();
      }
    }
  };
}
