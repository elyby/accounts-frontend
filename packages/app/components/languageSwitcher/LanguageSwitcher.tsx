import React, { ComponentType, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import LOCALES from 'app/i18n';
import { changeLang } from 'app/components/user/actions';
import { RootState } from 'app/reducers';

import LanguageSwitcherPopup from './LanguageSwitcherPopup';

type Props = {
    onClose?: () => void;
};

const LanguageSwitcher: ComponentType<Props> = ({ onClose = () => {} }) => {
    const selectedLocale = useSelector((state: RootState) => state.i18n.locale);
    const dispatch = useDispatch();

    const onChangeLang = useCallback(
        (lang: string) => {
            dispatch(changeLang(lang));
            // TODO: await language change and close popup, but not earlier than after 300ms
            setTimeout(onClose, 300);
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
