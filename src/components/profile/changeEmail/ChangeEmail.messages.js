import { defineMessages } from 'react-intl';

export default defineMessages({
    changeEmailTitle: {
        id: 'changeEmailTitle',
        defaultMessage: 'Change E-mail'
        // defaultMessage: 'Смена E-mail'
    },
    changeEmailDescription: {
        id: 'changeEmailDescription',
        defaultMessage: 'To change current account E-mail you must first verify that you own the current address and then confirm the new one.'
        // defaultMessage: 'Для смены E-mail адреса аккаунта сперва необходимо подтвердить владение текущим адресом, а за тем привязать новый.'
    },
    currentAccountEmail: {
        id: 'currentAccountEmail',
        defaultMessage: 'Current account E-mail address:'
        // defaultMessage: 'Текущий E-mail адрес, привязанный к аккаунту:'
    },
    pressButtonToStart: {
        id: 'pressButtonToStart',
        defaultMessage: 'Press the button below to send a message with the code for E-mail change initialization.'
        // defaultMessage: 'Нажмите кнопку ниже, что бы отправить письмо с кодом для инциализации процесса смены E-mail адреса.'
    },
    enterInitializationCode: {
        id: 'enterInitializationCode',
        defaultMessage: 'The E-mail with an initialization code for E-mail change procedure was sent to {email}. Please enter the code into the field below:'
        // defaultMessage: 'На E-mail {email} было отправлено письмо с кодом для инициализации смены E-mail адреса. Введите его в поле ниже:'
    },
//
    enterNewEmail: {
        id: 'enterNewEmail',
        defaultMessage: 'Then provide your new E-mail address, that you want to use with this account. You will be mailed with confirmation code.'
        // defaultMessage: 'За тем укажите новый E-mail адрес, к котором хотите привязать свой аккаунт. На него будет выслан код с подтверждением.'
    },
    enterFinalizationCode: {
        id: 'enterFinalizationCode',
        defaultMessage: 'The E-mail change confirmation code was sent to {email}. Please enter the code received into the field below:'
        // defaultMessage: 'На указанный E-mail {email} было выслано письмо с кодом для завершщения смены E-mail адреса. Введите полученный код в поле ниже:'
    },
//
    newEmailPlaceholder: {
        id: 'newEmailPlaceholder',
        defaultMessage: 'Enter new E-mail'
        // defaultMessage: 'Введите новый E-mail'
    },
    codePlaceholder: {
        id: 'codePlaceholder',
        defaultMessage: 'Paste the code here'
        // defaultMessage: 'Вставьте код сюда'
    },
    sendEmailButton: {
        id: 'sendEmailButton',
        defaultMessage: 'Send E-mail'
        // defaultMessage: 'Отправить E-mail'
    },
    changeEmailButton: {
        id: 'changeEmailButton',
        defaultMessage: 'Change E-mail'
        // defaultMessage: 'Сменить E-mail'
    },
    alreadyReceivedCode: {
        id: 'alreadyReceivedCode',
        defaultMessage: 'Already received code'
        // defaultMessage: 'Я получил код'
    }
});
