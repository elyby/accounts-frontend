// @flow
import React, { Component } from 'react';
import { FormattedMessage as Message, intlShape } from 'react-intl';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { changeLang } from 'components/user/actions';
import LANGS from 'i18n/index.json';
import formStyles from 'components/ui/form/form.scss';
import popupStyles from 'components/ui/popup/popup.scss';
import icons from 'components/ui/icons.scss';

import styles from './languageSwitcher.scss';
import messages from './languageSwitcher.intl.json';
import LanguageList from './LanguageList';

const translateUrl = 'http://ely.by/translate';

export type LocaleData = {
    code: string,
    name: string,
    englishName: string,
    progress: number,
    isReleased: bool,
};

export type LocalesMap = {[code: string]: LocaleData};

type OwnProps = {|
    onClose: () => void,
    langs: LocalesMap,
    emptyCaptions: Array<{
        src: string,
        caption: string,
    }>,
|};

type Props = {
    ...OwnProps,
    selectedLocale: string,
    changeLang: (lang: string) => void,
};

class LanguageSwitcher extends Component<Props, {
    filter: string,
    filteredLangs: LocalesMap,
}> {
    static contextTypes = {
        intl: intlShape,
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
        const { selectedLocale, onClose } = this.props;
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
                            selectedLocale={selectedLocale}
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
                                    <Message {...messages.improveTranslatesDescription} />
                                    {' '}
                                    <a href={translateUrl} target="_blank">
                                        <Message {...messages.improveTranslatesParticipate} />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    onChangeLang = this.changeLang.bind(this);

    changeLang(lang: string) {
        this.props.changeLang(lang);

        setTimeout(this.props.onClose, 300);
    }

    onFilterUpdate = (event: SyntheticInputEvent<HTMLInputElement>) => {
        const filter = event.currentTarget.value.trim().toLowerCase();
        const { langs } = this.props;

        const result = Object.keys(langs).reduce((previous, key) => {
            if (langs[key].englishName.toLowerCase().indexOf(filter) === -1
                && langs[key].name.toLowerCase().indexOf(filter) === -1
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
        return (event: SyntheticKeyboardEvent<HTMLInputElement>) => {
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

export default connect<Props, OwnProps, _, _, _, _>((state) => ({
    selectedLocale: state.i18n.locale,
}), {
    changeLang,
})(LanguageSwitcher);
