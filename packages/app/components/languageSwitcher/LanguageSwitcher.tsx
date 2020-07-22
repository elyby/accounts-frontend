import React, { ComponentType, useCallback } from 'react';

import LOCALES from 'app/i18n';
import { changeLang } from 'app/components/user/actions';
import { useReduxDispatch, useReduxSelector } from 'app/functions';

import LanguageSwitcherPopup from './LanguageSwitcherPopup';

type Props = {
    onClose?: () => void;
};

const LanguageSwitcher: ComponentType<Props> = ({ onClose = () => {} }) => {
    const selectedLocale = useReduxSelector((state) => state.i18n.locale);
    const dispatch = useReduxDispatch();

    const onChangeLang = useCallback(
        (lang: string) => {
            Promise.all([
                // 300ms is necessary for the visual animation of the language change to be completed
                new Promise((resolve) => setTimeout(resolve, 300)),
                dispatch(changeLang(lang)),
            ]).then(onClose);
        },
        [dispatch, onClose],
    );

    return (
        <LanguageSwitcherPopup
            locales={LOCALES}
            activeLocale={selectedLocale}
            onSelect={onChangeLang}
            onClose={onClose}
        />
    );
};

export default LanguageSwitcher;
