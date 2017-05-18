import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';

import classNames from 'classnames';
import { FormattedMessage as Message } from 'react-intl';

import styles from './langMenu.scss';
import messages from './langMenu.intl.json';

import LANGS from 'i18n/index.json';

class LangMenu extends Component {
    static displayName = 'LangMenu';
    static propTypes = {
        showCurrentLang: PropTypes.bool,
        toggleRef: PropTypes.func,
        userLang: PropTypes.string,
        changeLang: PropTypes.func
    };
    static defaultProps = {
        toggleRef: () => {},
        showCurrentLang: false
    };

    state = {
        isActive: false
    };

    componentDidMount() {
        document.addEventListener('click', this.onBodyClick);
        this.props.toggleRef(this.toggle.bind(this));
    }

    componentWillUnmount() {
        document.removeEventListener('click', this.onBodyClick);
        this.props.toggleRef(null);
    }

    render() {
        const {userLang, showCurrentLang} = this.props;
        const {isActive} = this.state;

        return (
            <div className={classNames(styles.container, {
                [styles.withCurrentLang]: showCurrentLang
            })}>
                <div className={styles.menuContainer}>
                    <ul className={classNames(styles.menu, {
                        [styles.menuActive]: isActive
                    })}>
                        {Object.keys(LANGS).map((locale) => (
                            <li className={classNames(styles.menuItem, {
                                [styles.activeMenuItem]: locale === userLang
                            })} onClick={this.onChangeLang(locale)} key={locale}
                            >
                                {this.renderLangLabel(locale)}
                            </li>
                        ))}
                        <li className={styles.improveTranslatesLink}>
                            <a href="https://ely-translates.oneskyapp.com/collaboration/project?id=201323" target="_blank">
                                <Message {...messages.improveTranslations} />
                            </a>
                        </li>
                    </ul>
                </div>

                <div className={styles.triggerContainer} onClick={this.onToggle}>
                    <a className={styles.trigger} href="#">
                        {showCurrentLang
                            ? this.renderLangLabel(userLang) : (
                            <span>
                                <span className={styles.triggerIcon} />
                                {' '}
                                <Message {...messages.siteLanguage} />
                                {' '}
                                <span className={isActive ? styles.triggerArrowBottom : styles.triggerArrowTop} />
                            </span>
                        )}
                    </a>
                </div>
            </div>
        );
    }

    renderLangLabel(locale) {
        const langLabel = LANGS[locale].name;

        return (
            <span>
                <span className={styles[`lang${locale[0].toUpperCase() + locale.slice(1)}`]} />
                {langLabel}
            </span>
        );
    }

    onChangeLang(lang) {
        return (event) => {
            event.preventDefault();

            this.props.changeLang(lang);
            this.setState({
                isActive: false
            });
        };
    }

    onBodyClick = (event) => {
        if (this.state.isActive) {
            const el = ReactDOM.findDOMNode(this);

            if (!el.contains(event.target) && el !== event.taget) {
                event.preventDefault();

                // add a small delay for the case someone have alredy called toggle
                setTimeout(() => this.state.isActive && this.toggle(), 0);
            }
        }
    };

    onToggle = (event) => {
        event.preventDefault();

        this.toggle();
    };

    toggle = () => {
        // add small delay to skip click event on body
        setTimeout(() => this.setState({
            isActive: !this.state.isActive
        }), 0);
    };
}

import { connect } from 'react-redux';
import { changeLang } from 'components/user/actions';

export default connect((state) => ({
    userLang: state.user.lang
}), {
    changeLang
})(LangMenu);
