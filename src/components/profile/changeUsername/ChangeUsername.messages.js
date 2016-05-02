import { defineMessages } from 'react-intl';

export default defineMessages({
    changeUsernameTitle: {
        id: 'changeUsernameTitle',
        defaultMessage: 'Change nickname'
        // defaultMessage: 'Смена никнейма'
    },
    changeUsernameDescription: {
        id: 'changeUsernameDescription',
        defaultMessage: 'You can change your nickname to any arbitrary value. Remember that it is not recommended to take a nickname of already existing Mojang account.'
        // defaultMessage: 'Вы можете сменить свой никнейм на любое допустимое значение. Помните о том, что не рекомендуется занимать никнеймы пользователей Mojang.'
    },
    changeUsernameWarning: {
        id: 'changeUsernameWarning',
        defaultMessage: 'Be careful: if you playing on the server with nickname binding, then after changing nickname you may lose all your progress.'
        // defaultMessage: 'Будьте внимательны: если вы играли на сервере с привязкой по нику, то после смены ника вы можете утратить весь свой прогресс.'
    },
    changeUsernameButton: {
        id: 'changeUsernameButton',
        defaultMessage: 'Change nickname'
        // defaultMessage: 'Сменить никнейм'
    }
});
