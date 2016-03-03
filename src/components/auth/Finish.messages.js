import { defineMessages } from 'react-intl';

export default defineMessages({
    authForAppSuccessful: {
        id: 'authForAppSuccessful',
        defaultMessage: 'Авторизация для {appName} успешно выполнена'
    },
    authForAppFailed: {
        id: 'authForAppFailed',
        defaultMessage: 'Авторизация для {appName} не удалась'
    },
    waitAppReaction: {
        id: 'waitAppReaction',
        defaultMessage: 'Пожалуйста, дождитесь реакции вашего приложения'
    },
    passCodeToApp: {
        id: 'passCodeToApp',
        defaultMessage: 'Чтобы завершить процесс авторизации, пожалуйста, передай {appName} этот код'
    },
    copy: {
        id: 'copy',
        defaultMessage: 'Скопировать'
    }
});
