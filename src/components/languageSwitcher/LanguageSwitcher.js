// @flow
import React, { Component } from 'react';
import { FormattedMessage as Message, intlShape } from 'react-intl';
import classNames from 'classnames';

import LANGS from 'i18n/index.json';
import formStyles from 'components/ui/form/form.scss';
import popupStyles from 'components/ui/popup/popup.scss';
import icons from 'components/ui/icons.scss';
import styles from './languageSwitcher.scss';
import messages from './languageSwitcher.intl.json';
import LanguageList from './LanguageList';

const improveTranslationUrl = 'http://ely.by/erickskrauch/posts/174943';

export type LocaleData = {
    code: string,
    name: string,
    englishName: string,
    progress: number,
    isReleased: bool,
};

export type LocalesMap = {[code: string]: LocaleData};

class LanguageSwitcher extends Component<{
    onClose: Function,
    userLang: string,
    changeLang: (lang: string) => void,
    langs: LocalesMap,
    emptyCaptions: Array<{
        src: string,
        caption: string,
    }>,
}, {
    filter: string,
    filteredLangs: LocalesMap,
}> {
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
    };

    render() {
        const { userLang, onClose } = this.props;
        const { filteredLangs } = this.state;

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

                        <LanguageList
                            userLang={userLang}
                            langs={filteredLangs}
                            onChangeLang={this.onChangeLang}
                        />

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

    onChangeLang = this.changeLang.bind(this);

    changeLang(lang) {
        this.props.changeLang(lang);

        setTimeout(this.props.onClose, 300);
    }

    onFilterUpdate = (event: SyntheticInputEvent<HTMLInputElement>) => {
        const filter = event.currentTarget.value.trim().toLowerCase();
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
        return (event: SyntheticInputEvent<HTMLInputElement>) => {
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
}

import { connect } from 'react-redux';
import { changeLang } from 'components/user/actions';

export default connect((state) => ({
    userLang: state.user.lang,
}), {
    changeLang,
})(LanguageSwitcher);
