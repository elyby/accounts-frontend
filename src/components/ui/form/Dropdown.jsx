import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';

import classNames from 'classnames';

import styles from './dropdown.scss';
import FormComponent from './FormComponent';

export default class Dropdown extends FormComponent {
    static displayName = 'Dropdown';

    static propTypes = {
        label: PropTypes.oneOfType([
            PropTypes.shape({
                id: PropTypes.string
            }),
            PropTypes.string
        ]).isRequired,
        items: PropTypes.arrayOf(PropTypes.string).isRequired,
        block: PropTypes.bool,
        color: PropTypes.oneOf(['green', 'blue', 'red', 'lightViolet', 'darkBlue', 'violet'])
    };

    state = {
        isActive: false,
        activeItem: this.props.label
    };

    componentDidMount() {
        document.addEventListener('click', this.onBodyClick);
    }

    componentWillUnmount() {
        document.removeEventListener('click', this.onBodyClick);
    }

    render() {
        const { color = 'green', block, items } = this.props;
        const {isActive, activeItem} = this.state;

        const label = this.formatMessage(activeItem);

        return (
            <div className={classNames(styles[color], {
                [styles.block]: block
            })} {...this.props} onClick={this.onToggle}>
                {label}
                <span className={styles.toggleIcon} />

                <div className={classNames(styles.menu, {
                    [styles.menuActive]: isActive
                })}>
                    {items.map((item, key) => (
                        <div className={styles.menuItem} key={key} onClick={this.onSelectItem(item)}>
                            {item}
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    toggle() {
        this.setState({
            isActive: !this.state.isActive
        });
    }

    onSelectItem(item) {
        return (event) => {
            event.preventDefault();

            this.setState({
                activeItem: item
            });
        };
    }

    onToggle = (event) => {
        event.preventDefault();

        this.toggle();
    };

    onBodyClick = (event) => {
        if (this.state.isActive) {
            const el = ReactDOM.findDOMNode(this);

            if (!el.contains(event.target) && el !== event.taget) {
                event.preventDefault();

                this.toggle();
            }
        }
    };
}
