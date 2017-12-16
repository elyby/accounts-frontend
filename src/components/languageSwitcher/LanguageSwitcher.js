import React, { Component } from 'react';
import PropTypes from 'prop-types';

import classNames from 'classnames';
import { FormattedMessage as Message, intlShape } from 'react-intl';

import { requireLocaleFlag } from 'functions';
import LANGS from 'i18n/index.json';

import formStyles from 'components/ui/form/form.scss';
import popupStyles from 'components/ui/popup/popup.scss';
import icons from 'components/ui/icons.scss';
import styles from './languageSwitcher.scss';
import messages from './languageSwitcher.intl.json';

const improveTranslationUrl = 'http://ely.by/erickskrauch/posts/174943';

class LanguageSwitcher extends Component {
    static displayName = 'LanguageSwitcher';

    static propTypes = {
        onClose: PropTypes.func,
        userLang: PropTypes.string,
        changeLang: PropTypes.func,
    };

    static contextTypes = {
        intl: intlShape.isRequired,
    };

    state = {
        items: [],
        filter: '',
    };

    static defaultProps = {
        onClose() {}
    };

    componentWillMount() {
        this.setState({items: LANGS});
    }

    render() {
        const {userLang, onClose} = this.props;
        const {items} = this.state;

        return (
            <div className={styles.languageSwitcher}>
                <div className={popupStyles.popup}>
                    <div className={popupStyles.header}>
                        <h2 className={popupStyles.headerTitle}>
                            <Message {...messages.siteLanguage} />
                        </h2>
                        <span className={classNames(icons.close, popupStyles.close)} onClick={onClose} />
                    </div>

                    <div className={styles.languageSwitcherBody}>
                        <div className={styles.searchBox}>
                            <input
                                className={classNames(
                                    formStyles.lightTextField,
                                    formStyles.greenTextField
                                )}
                                placeholder={this.context.intl.formatMessage(messages.startTyping)}
                                onChange={this.onFilterUpdate()}
                                onKeyPress={this.onFilterKeyPress()}
                                autoFocus
                            />
                            <span className={styles.searchIcon} />
                        </div>

                        <div className={styles.languagesList}>
                            {Object.keys(items).map((locale) => (
                                <li className={classNames(styles.languageItem, {
                                    [styles.activeLanguageItem]: locale === userLang
                                })} onClick={this.onChangeLang(locale)} key={locale}
                                >
                                    {this.renderLanguageItem(locale, items[locale])}
                                </li>
                            ))}
                        </div>

                        <div className={styles.improveTranslates}>
                            <div className={styles.improveTranslatesIcon} />
                            <div className={styles.improveTranslatesContent}>
                                <div className={styles.improveTranslatesTitle}>
                                    <Message {...messages.improveTranslates} />
                                </div>
                                <div className={styles.improveTranslatesText}>
                                    <Message {...messages.improveTranslatesDescription} values={{
                                        articleLink: (
                                            <a href={improveTranslationUrl} target="_blank">
                                                <Message {...messages.improveTranslatesArticleLink} />
                                            </a>
                                        )
                                    }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    renderLanguageItem(locale, localeData) {
        const {name, progress, isReleased} = localeData;
        let progressLabel;
        if (progress !== 100) {
            progressLabel = (
                <Message {...messages.translationProgress} values={{
                    progress: `${progress}%`,
                }} />
            );
        } else if (!isReleased) {
            progressLabel = (
                <Message {...messages.mayBeInaccurate} />
            );
        }

        return (
            <div className={styles.languageFlex}>
                <div className={styles.languageIco} style={{
                    backgroundImage: `url('${requireLocaleFlag(locale)}')`
                }} />
                <div className={styles.languageCaptions}>
                    <div className={styles.languageName}>
                        {name}
                    </div>
                    <div className={styles.languageSubName}>
                        {localeData.englishName} {progressLabel ? '| ' : ''} {progressLabel}
                    </div>
                </div>
                <span className={styles.languageCircle} />
            </div>
        );
    }

    onChangeLang(lang) {
        return (event) => {
            event.preventDefault();
            this.changeLang(lang);
        };
    }

    changeLang(lang) {
        this.props.changeLang(lang);
        setTimeout(this.props.onClose, 300);
    }

    onFilterUpdate() {
        return (event) => {
            const value = event.target.value.trim().toLowerCase();
            let items = LANGS;
            if (value.length !== 0) {
                items = Object.keys(items).reduce((prev, next) => {
                    if (items[next].englishName.toLowerCase().search(value) !== -1
                     || items[next].name.toLowerCase().search(value) !== -1
                    ) {
                        prev[next] = items[next];
                    }

                    return prev;
                }, {});
            }

            this.setState({
                items,
                filter: value,
            });
        };
    }

    onFilterKeyPress() {
        return (event) => {
            if (event.key !== 'Enter' || this.state.filter === '') {
                return;
            }

            const locales = Object.keys(this.state.items);
            if (locales.length === 0) {
                return;
            }

            this.changeLang(locales[0]);
        };
    }
}

import { connect } from 'react-redux';
import { changeLang } from 'components/user/actions';

export default connect((state) => ({
    userLang: state.user.lang
}), {
    changeLang
})(LanguageSwitcher);
