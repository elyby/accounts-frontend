import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import classNames from 'classnames';

import buttons from 'components/ui/buttons.scss';
import { AccountSwitcher } from 'components/accounts';

import styles from './loggedInPanel.scss';

import { userShape } from 'components/user/User';

export default class LoggedInPanel extends Component {
    static displayName = 'LoggedInPanel';
    static propTypes = {
        user: userShape
    };

    state = {
        isAccountSwitcherActive: false
    };

    componentDidMount() {
        document.addEventListener('click', this.onBodyClick);
    }

    componentWillUnmount() {
        document.removeEventListener('click', this.onBodyClick);
    }

    render() {
        const { user } = this.props;
        const { isAccountSwitcherActive } = this.state;

        return (
            <div className={classNames(styles.loggedInPanel)}>
                <div className={classNames(styles.activeAccount, {
                    [styles.activeAccountExpanded]: isAccountSwitcherActive
                })}>
                    <button className={styles.activeAccountButton} onClick={this.onExpandAccountSwitcher}>
                        <span className={styles.userIcon} />
                        <span className={styles.userName}>{user.username}</span>
                        <span className={styles.expandIcon} />
                    </button>

                    <div className={classNames(styles.accountSwitcherContainer)}>
                        <AccountSwitcher skin="light" onAfterAction={this.toggleAccountSwitcher} />
                    </div>
                </div>
            </div>
        );
    }

    toggleAccountSwitcher = () => this.setState({
        isAccountSwitcherActive: !this.state.isAccountSwitcherActive
    });

    onExpandAccountSwitcher = (event) => {
        event.preventDefault();

        this.toggleAccountSwitcher();
    };

    onBodyClick = createOnOutsideComponentClickHandler(
        () => ReactDOM.findDOMNode(this),
        () => this.state.isAccountSwitcherActive,
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
 * @return {function}
 */
function createOnOutsideComponentClickHandler(getEl, isActive, callback) {
    // TODO: we have the same logic in LangMenu
    // Probably we should decouple this into some helper function
    // TODO: the name of function may be better...
    return (event) => {
        if (isActive()) {
            const el = getEl();

            if (!el.contains(event.target) && el !== event.taget) {
                event.preventDefault();

                // add a small delay for the case someone have alredy called toggle
                setTimeout(() => isActive() && callback(), 0);
            }
        }
    };
}
