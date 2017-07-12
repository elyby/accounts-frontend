// @flow
import React, { Component } from 'react';

import classNames from 'classnames';

import { AccountSwitcher } from 'components/accounts';

import styles from './loggedInPanel.scss';

import type { User } from 'components/user';

export default class LoggedInPanel extends Component {
    props: {
        user: User
    };

    state = {
        isAccountSwitcherActive: false
    };

    _isMounted: boolean = false;
    el: ?HTMLElement;

    componentDidMount() {
        if (window.document) {
            window.document.addEventListener('click', this.onBodyClick);
        }

        this._isMounted = true;
    }

    componentWillUnmount() {
        if (window.document) {
            window.document.removeEventListener('click', this.onBodyClick);
        }

        this._isMounted = false;
    }

    render() {
        const { user } = this.props;
        const { isAccountSwitcherActive } = this.state;

        return (
            <div ref={(el) => this.el = el} className={classNames(styles.loggedInPanel)}>
                <div className={classNames(styles.activeAccount, {
                    [styles.activeAccountExpanded]: isAccountSwitcherActive
                })}>
                    <button className={styles.activeAccountButton} onClick={this.onExpandAccountSwitcher}>
                        <span className={styles.userIcon} />
                        <span className={styles.userName}>{user.username}</span>
                        <span className={styles.expandIcon} />
                    </button>

                    <div className={classNames(styles.accountSwitcherContainer)}>
                        <AccountSwitcher skin="light" onAfterAction={this.onToggleAccountSwitcher} />
                    </div>
                </div>
            </div>
        );
    }

    toggleAccountSwitcher = () => this._isMounted && this.setState({
        isAccountSwitcherActive: !this.state.isAccountSwitcherActive
    });

    onToggleAccountSwitcher = () => {
        this.toggleAccountSwitcher();
    };

    onExpandAccountSwitcher = (event: Event) => {
        event.preventDefault();

        this.toggleAccountSwitcher();
    };

    onBodyClick = createOnOutsideComponentClickHandler(
        () => this.el,
        () => this.state.isAccountSwitcherActive && this._isMounted,
        () => this.toggleAccountSwitcher()
    );
}

/**
 * Creates an event handling function to handle clicks outside the component
 *
 * The handler will check if current click was outside container el and if so
 * and component isActive, it will call the callback
 *
 * @param  {function} getEl - the function, that returns reference to container el
 * @param  {function} isActive - whether the component is active and callback may be called
 * @param  {function} callback - the callback to call, when there was a click outside el
 *
 * @return {function}
 */
function createOnOutsideComponentClickHandler(
    getEl: () => ?HTMLElement,
    isActive: () => boolean,
    callback: Function
) {
    // TODO: we have the same logic in LangMenu
    // Probably we should decouple this into some helper function
    // TODO: the name of function may be better...
    return (event: MouseEvent & {target: HTMLElement}) => {
        const el = getEl();

        if (isActive() && el) {
            if (!el.contains(event.target) && el !== event.target) {
                event.preventDefault();

                // add a small delay for the case someone have alredy called toggle
                setTimeout(() => isActive() && callback(), 0);
            }
        }
    };
}
