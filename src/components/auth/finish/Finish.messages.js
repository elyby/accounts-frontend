import { defineMessages } from 'react-intl';

export default defineMessages({
    authForAppSuccessful: {
        id: 'authForAppSuccessful',
        defaultMessage: 'Authorization for {appName} was successfully completed'
        // defaultMessage: 'Авторизация для {appName} успешно выполнена'
    },
    authForAppFailed: {
        id: 'authForAppFailed',
        defaultMessage: 'Authorization for {appName} was failed'
        // defaultMessage: 'Авторизация для {appName} не удалась'
    },
    waitAppReaction: {
        id: 'waitAppReaction',
        defaultMessage: 'Please, wait till your application response'
        // defaultMessage: 'Пожалуйста, дождитесь реакции вашего приложения'
    },
    passCodeToApp: {
        id: 'passCodeToApp',
        defaultMessage: 'To complete authorization process, please, provide the following code to {appName}'
        // defaultMessage: 'Чтобы завершить процесс авторизации, пожалуйста, передай {appName} этот код'
    },
    copy: {
        id: 'copy',
        defaultMessage: 'Copy'
        // defaultMessage: 'Скопировать'
    }
});
