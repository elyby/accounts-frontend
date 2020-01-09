import React from 'react';
import clsx from 'clsx';
import { AccountSwitcher } from 'app/components/accounts';

import styles from './loggedInPanel.scss';

export default class LoggedInPanel extends React.Component<
  {
    username: string;
  },
  {
    isAccountSwitcherActive: boolean;
  }
> {
  state = {
    isAccountSwitcherActive: false,
  };

  _isMounted: boolean = false;
  el: HTMLElement | null;

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
    const { username } = this.props;
    const { isAccountSwitcherActive } = this.state;

    return (
      <div ref={el => (this.el = el)} className={clsx(styles.loggedInPanel)}>
        <div
          className={clsx(styles.activeAccount, {
            [styles.activeAccountExpanded]: isAccountSwitcherActive,
          })}
        >
          <button
            className={styles.activeAccountButton}
            onClick={this.onExpandAccountSwitcher}
          >
            <span className={styles.userIcon} />
            <span className={styles.userName}>{username}</span>
            <span className={styles.expandIcon} />
          </button>

          <div className={clsx(styles.accountSwitcherContainer)}>
            <AccountSwitcher
              skin="light"
              onAfterAction={this.onToggleAccountSwitcher}
            />
          </div>
        </div>
      </div>
    );
  }

  toggleAccountSwitcher = () =>
    this._isMounted &&
    this.setState({
      isAccountSwitcherActive: !this.state.isAccountSwitcherActive,
    });

  onToggleAccountSwitcher = () => {
    this.toggleAccountSwitcher();
  };

  onExpandAccountSwitcher = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    this.toggleAccountSwitcher();
  };

  onBodyClick = createOnOutsideComponentClickHandler(
    () => this.el,
    () => this.state.isAccountSwitcherActive && this._isMounted,
    () => this.toggleAccountSwitcher(),
  );
}

/**
 * Creates an event handling function to handle clicks outside the component
 *
 * The handler will check if current click was outside container el and if so
 * and component isActive, it will call the callback
 *
 * @param  {Function} getEl - the function, that returns reference to container el
 * @param  {Function} isActive - whether the component is active and callback may be called
 * @param  {Function} callback - the callback to call, when there was a click outside el
 *
 * @returns {Function}
 */
function createOnOutsideComponentClickHandler(
  getEl: () => HTMLElement | null,
  isActive: () => boolean,
  callback: () => void,
) {
  // TODO: we have the same logic in LangMenu
  // Probably we should decouple this into some helper function
  // TODO: the name of function may be better...
  return (event: { target: HTMLElement } & MouseEvent) => {
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
