import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { TransitionMotion, spring, presets } from 'react-motion';
import { FormattedMessage as Message, intlShape } from 'react-intl';

import classNames from 'classnames';

import { localeFlags } from 'components/i18n';
import LANGS from 'i18n/index.json';

import formStyles from 'components/ui/form/form.scss';
import popupStyles from 'components/ui/popup/popup.scss';
import icons from 'components/ui/icons.scss';
import styles from './languageSwitcher.scss';
import messages from './languageSwitcher.intl.json';

import thatFuckingPumpkin from './images/that_fucking_pumpkin.svg';
import mayTheForceBeWithYou from './images/may_the_force_be_with_you.svg';
import biteMyShinyMetalAss from './images/bite_my_shiny_metal_ass.svg';
import iTookAnArrowInMyKnee from './images/i_took_an_arrow_in_my_knee.svg';

const improveTranslationUrl = 'http://ely.by/erickskrauch/posts/174943';
const itemHeight = 51;

class LanguageSwitcher extends Component {
    static displayName = 'LanguageSwitcher';

    static propTypes = {
        onClose: PropTypes.func,
        userLang: PropTypes.string,
        changeLang: PropTypes.func,
        langs: PropTypes.objectOf(PropTypes.shape({
            name: PropTypes.string.isRequired,
            englishName: PropTypes.string.isRequired,
            progress: PropTypes.number.isRequired,
            isReleased: PropTypes.bool.isRequired,
        })).isRequired,
        emptyCaptions: PropTypes.arrayOf(PropTypes.shape({
            src: PropTypes.string.isRequired,
            caption: PropTypes.string.isRequired,
        })).isRequired,
    };

    static contextTypes = {
        intl: intlShape.isRequired,
    };

    state = {
        filter: '',
        filteredLangs: this.props.langs,
    };

    static defaultProps = {
        langs: LANGS,
        onClose() {},
        emptyCaptions: [
            {
                // Homestuck
                src: thatFuckingPumpkin,
                caption: 'That fucking pumpkin',
            },
            {
                // Star Wars
                src: mayTheForceBeWithYou,
                caption: 'May The Force Be With You',
            },
            {
                // Futurama
                src: biteMyShinyMetalAss,
                caption: 'Bite my shiny metal ass',
            },
            {
                // The Elder Scrolls V: Skyrim
                src: iTookAnArrowInMyKnee,
                caption: 'I took an arrow in my knee',
            },
        ],
    };

    render() {
        const {userLang, onClose, emptyCaptions} = this.props;
        const isListEmpty = Object.keys(this.state.filteredLangs).length === 0;
        const firstLocale = Object.keys(this.state.filteredLangs)[0] || null;
        const emptyCaption = emptyCaptions[Math.floor(Math.random() * emptyCaptions.length)];

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
                                    formStyles.greenTextField,
                                )}
                                placeholder={this.context.intl.formatMessage(messages.startTyping)}
                                onChange={this.onFilterUpdate}
                                onKeyPress={this.onFilterKeyPress()}
                                autoFocus
                            />
                            <span className={styles.searchIcon} />
                        </div>

                        <TransitionMotion
                            defaultStyles={this.getItemsWithDefaultStyles()}
                            styles={this.getItemsWithStyles()}
                            willLeave={this.willLeave}
                            willEnter={this.willEnter}
                        >
                            {(items) => (
                                <div className={styles.languagesList}>
                                    <div
                                        className={classNames(styles.emptyLanguagesListWrapper, {
                                            [styles.emptyLanguagesListVisible]: isListEmpty,
                                        })}
                                        style={{
                                            height: isListEmpty ? this.emptyListStateInner.clientHeight : 0,
                                        }}
                                    >
                                        <div
                                            ref={(elem) => this.emptyListStateInner = elem}
                                            className={styles.emptyLanguagesList}
                                        >
                                            <img
                                                src={emptyCaption.src}
                                                alt={emptyCaption.caption}
                                                className={styles.emptyLanguagesListCaption}
                                            />
                                            <div className={styles.emptyLanguagesListSubtitle}>
                                                <Message {...messages.weDoNotSupportThisLang} />
                                            </div>
                                        </div>
                                    </div>

                                    {items.map(({key: locale, data: definition, style}) => (
                                        <li
                                            key={locale}
                                            style={style}
                                            className={classNames(styles.languageItem, {
                                                [styles.activeLanguageItem]: locale === userLang,
                                                [styles.firstLanguageItem]: locale === firstLocale,
                                            })}
                                            onClick={this.onChangeLang(locale)}
                                        >
                                            {this.renderLanguageItem(locale, definition)}
                                        </li>
                                    ))}
                                </div>
                            )}
                        </TransitionMotion>

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
                                        ),
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
                    progress,
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
                    backgroundImage: `url('${localeFlags.getIconUrl(locale)}')`,
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

    onFilterUpdate = (event) => {
        const filter = event.target.value.trim().toLowerCase();
        const { langs } = this.props;
        const result = Object.keys(langs).reduce((previous, key) => {
            if (langs[key].englishName.toLowerCase().search(filter) === -1
             && langs[key].name.toLowerCase().search(filter) === -1
            ) {
                return previous;
            }

            previous[key] = langs[key];

            return previous;
        }, {});

        this.setState({
            filter,
            filteredLangs: result,
        });
    };

    onFilterKeyPress() {
        return (event) => {
            if (event.key !== 'Enter' || this.state.filter === '') {
                return;
            }

            const locales = Object.keys(this.state.filteredLangs);
            if (locales.length === 0) {
                return;
            }

            this.changeLang(locales[0]);
        };
    }

    getItemsWithDefaultStyles = () => Object.keys(this.props.langs).reduce((previous, key) => {
        return [
            ...previous,
            {
                key,
                data: this.props.langs[key],
                style: {
                    height: itemHeight,
                    opacity: 1,
                },
            },
        ];
    }, {});

    getItemsWithStyles = () => Object.keys({...this.state.filteredLangs}).reduce((previous, key) => [
        ...previous,
        {
            key,
            data: this.props.langs[key],
            style: {
                height: spring(itemHeight, presets.gentle),
                opacity: spring(1, presets.gentle),
            },
        },
    ], []);

    willEnter() {
        return {
            height: 0,
            opacity: 1,
        };
    }

    willLeave() {
        return {
            height: spring(0),
            opacity: spring(0),
        };
    }
}

import { connect } from 'react-redux';
import { changeLang } from 'components/user/actions';

export default connect((state) => ({
    userLang: state.user.lang,
}), {
    changeLang,
})(LanguageSwitcher);
