import React, { MouseEventHandler } from 'react';
import {
    TransitionMotion,
    spring,
    presets,
    TransitionStyle,
    TransitionPlainStyle,
    PlainStyle,
    Style,
} from 'react-motion';
import { FormattedMessage as Message } from 'react-intl';
import clsx from 'clsx';

import LocaleItem from './LocaleItem';
import messages from './languageSwitcher.intl.json';
import { LocalesMap } from './LanguageSwitcher';
import styles from './languageSwitcher.scss';

import thatFuckingPumpkin from './images/that_fucking_pumpkin.svg';
import mayTheForceBeWithYou from './images/may_the_force_be_with_you.svg';
import biteMyShinyMetalAss from './images/bite_my_shiny_metal_ass.svg';
import iTookAnArrowInMyKnee from './images/i_took_an_arrow_in_my_knee.svg';

interface EmptyCaption {
    src: string;
    caption: string;
}

const emptyCaptions: ReadonlyArray<EmptyCaption> = [
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
];

const itemHeight = 51;

export default class LanguageList extends React.Component<{
    selectedLocale: string;
    langs: LocalesMap;
    onChangeLang: (lang: string) => void;
}> {
    emptyListStateInner: HTMLDivElement | null;

    render() {
        const { selectedLocale, langs } = this.props;
        const isListEmpty = Object.keys(langs).length === 0;
        const firstLocale = Object.keys(langs)[0] || null;
        const emptyCaption = this.getEmptyCaption();

        return (
            <TransitionMotion
                defaultStyles={this.getItemsWithDefaultStyles()}
                styles={this.getItemsWithStyles()}
                willLeave={this.willLeave}
                willEnter={this.willEnter}
            >
                {(items) => (
                    <div className={styles.languagesList} data-testid="language-list">
                        <div
                            className={clsx(styles.emptyLanguagesListWrapper, {
                                [styles.emptyLanguagesListVisible]: isListEmpty,
                            })}
                            style={{
                                height:
                                    isListEmpty && this.emptyListStateInner ? this.emptyListStateInner.clientHeight : 0,
                            }}
                        >
                            <div
                                ref={(elem: HTMLDivElement | null) => (this.emptyListStateInner = elem)}
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

                        {items.map(({ key: locale, data: definition, style }) => (
                            <div
                                key={locale}
                                style={style}
                                className={clsx(styles.languageItem, {
                                    [styles.activeLanguageItem]: locale === selectedLocale,
                                    [styles.firstLanguageItem]: locale === firstLocale,
                                })}
                                onClick={this.onChangeLang(locale)}
                            >
                                <LocaleItem locale={definition} />
                            </div>
                        ))}
                    </div>
                )}
            </TransitionMotion>
        );
    }

    getEmptyCaption(): EmptyCaption {
        return emptyCaptions[Math.floor(Math.random() * emptyCaptions.length)];
    }

    onChangeLang(lang: string): MouseEventHandler<HTMLDivElement> {
        return (event) => {
            event.preventDefault();

            this.props.onChangeLang(lang);
        };
    }

    getItemsWithDefaultStyles = (): Array<TransitionPlainStyle> => {
        return Object.keys({ ...this.props.langs }).reduce(
            (previous, key) => [
                ...previous,
                {
                    key,
                    data: this.props.langs[key],
                    style: {
                        height: itemHeight,
                        opacity: 1,
                    },
                },
            ],
            [] as Array<TransitionPlainStyle>,
        );
    };

    getItemsWithStyles = (): Array<TransitionStyle> => {
        return Object.keys({ ...this.props.langs }).reduce(
            (previous, key) => [
                ...previous,
                {
                    key,
                    data: this.props.langs[key],
                    style: {
                        height: spring(itemHeight, presets.gentle),
                        opacity: spring(1, presets.gentle),
                    },
                },
            ],
            [] as Array<TransitionStyle>,
        );
    };

    willEnter(): PlainStyle {
        return {
            height: 0,
            opacity: 1,
        };
    }

    willLeave(): Style {
        return {
            height: spring(0),
            opacity: spring(0),
        };
    }
}
