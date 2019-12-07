import React from 'react';
import { FormattedMessage as Message, injectIntl, IntlShape } from 'react-intl';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { changeLang } from 'app/components/user/actions';
import LANGS from 'app/i18n';
import formStyles from 'app/components/ui/form/form.scss';
import popupStyles from 'app/components/ui/popup/popup.scss';
import icons from 'app/components/ui/icons.scss';

import styles from './languageSwitcher.scss';
import messages from './languageSwitcher.intl.json';
import LanguageList from './LanguageList';
import { RootState } from 'app/reducers';

const translateUrl = 'http://ely.by/translate';

export type LocaleData = {
  code: string;
  name: string;
  englishName: string;
  progress: number;
  isReleased: boolean;
};

export type LocalesMap = { [code: string]: LocaleData };

type OwnProps = {
  onClose: () => void;
  langs: LocalesMap;
  emptyCaptions: Array<{
    src: string;
    caption: string;
  }>;
};

interface Props extends OwnProps {
  intl: IntlShape;
  selectedLocale: string;
  changeLang: (lang: string) => void;
}

class LanguageSwitcher extends React.Component<
  Props,
  {
    filter: string;
    filteredLangs: LocalesMap;
  }
> {
  state = {
    filter: '',
    filteredLangs: this.props.langs,
  };

  static defaultProps = {
    langs: LANGS,
    onClose() {},
  };

  render() {
    const { selectedLocale, onClose, intl } = this.props;
    const { filteredLangs } = this.state;

    return (
      <div className={styles.languageSwitcher}>
        <div className={popupStyles.popup}>
          <div className={popupStyles.header}>
            <h2 className={popupStyles.headerTitle}>
              <Message {...messages.siteLanguage} />
            </h2>
            <span
              className={classNames(icons.close, popupStyles.close)}
              onClick={onClose}
            />
          </div>

          <div className={styles.languageSwitcherBody}>
            <div className={styles.searchBox}>
              <input
                className={classNames(
                  formStyles.lightTextField,
                  formStyles.greenTextField,
                )}
                placeholder={intl.formatMessage(messages.startTyping)}
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
                  <Message {...messages.improveTranslatesDescription} />{' '}
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

  onFilterUpdate = (event: React.ChangeEvent<HTMLInputElement>) => {
    const filter = event.currentTarget.value.trim().toLowerCase();
    const { langs } = this.props;

    const result = Object.keys(langs).reduce((previous, key) => {
      if (
        langs[key].englishName.toLowerCase().indexOf(filter) === -1 &&
        langs[key].name.toLowerCase().indexOf(filter) === -1
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
    return (event: React.KeyboardEvent<HTMLInputElement>) => {
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

export default injectIntl(
  connect(
    (state: RootState) => ({
      selectedLocale: state.i18n.locale,
    }),
    {
      changeLang,
    },
  )(LanguageSwitcher),
);
