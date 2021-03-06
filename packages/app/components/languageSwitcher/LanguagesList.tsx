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
import { LocalesMap } from './LanguageSwitcherPopup';
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

export default class LanguagesList extends React.Component<{
    locales: LocalesMap;
    selectedLocale: string;
    onChangeLang?: (lang: string) => void;
}> {
    emptyListStateInner: HTMLDivElement | null;

    static defaultProps = {
        onChangeLang: (): void => {},
    };

    render() {
        const { selectedLocale, locales } = this.props;
        const isListEmpty = Object.keys(locales).length === 0;
        const firstLocale = Object.keys(locales)[0] || null;
        const emptyCaption = this.getEmptyCaption();

        return (
            <TransitionMotion
                defaultStyles={this.getItemsWithDefaultStyles()}
                styles={this.getItemsWithStyles()}
                willLeave={this.willLeave}
                willEnter={this.willEnter}
            >
                {(items) => (
                    <div className={styles.languagesList} data-testid="languages-list-item">
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
                                    <Message
                                        key="weDoNotSupportThisLang"
                                        defaultMessage="Sorry, we do not support this language"
                                    />
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

            // @ts-ignore has defaultProps value
            this.props.onChangeLang(lang);
        };
    }

    getItemsWithDefaultStyles = (): Array<TransitionPlainStyle> => {
        return Object.keys({ ...this.props.locales }).reduce(
            (previous, key) => [
                ...previous,
                {
                    key,
                    data: this.props.locales[key],
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
        return Object.keys({ ...this.props.locales }).reduce(
            (previous, key) => [
                ...previous,
                {
                    key,
                    data: this.props.locales[key],
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
