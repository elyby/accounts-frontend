import { defineMessages } from 'react-intl';

export default defineMessages({
    accountPreferencesTitle: {
        id: 'accountPreferencesTitle',
        defaultMessage: 'Ely.by account preferences'
        // defaultMessage: 'Настройки аккаунта Ely.by'
    },
    personalData: {
        id: 'personalData',
        defaultMessage: 'Personal data'
        // defaultMessage: 'Персональные данные'
    },
    accountDescription: {
        id: 'accountDescription',
        defaultMessage: 'Ely.by account allows you to get access to many Minecraft resources. Please, take care of your account safety. Use secure password and change it regularly.'
        // defaultMessage: 'Благодаря аккаунту Ely.by вы можете получить доступ ко многим ресурсам, связанным с Minecraft. Берегите свой аккаунт, используйте надёжный пароль и регулярно его меняйте.'
    },
    preferencesDescription: {
        id: 'preferencesDescription',
        defaultMessage: 'Here you can change the key preferences of your account. Please note that all actions must be confirmed by entering a password.'
        // defaultMessage: 'Здесь вы можете сменить ключевые параметры вашего аккаунта. Обратите внимание, что для всех действий необходимо подтверждение при помощи ввода пароля.'
    },
    mojangPriorityWarning: {
        id: 'mojangPriorityWarning',
        defaultMessage: 'A Mojang account with the same nickname was found. According to project rules, account owner has the right to demand the restoration of control over nickname.'
        // defaultMessage: 'Найден аккаунт Mojang с таким же ником и, по правилам проекта, его владелец вправе потребовать восстановления контроля над ником.'
    },
    oldHashingAlgoWarning: {
        id: 'oldHashingAlgoWarning',
        defaultMessage: 'Your was hashed with an old hashing algorithm.<br />Please, change password.'
        // defaultMessage: 'Для пароля применяется старый алгоритм хэширования<br />Пожалуйста, смените пароль.'
    },
    changedAt: {
        id: 'changedAt',
        defaultMessage: 'Changed {at}'
        // defaultMessage: 'Изменен {at}'
    },
    disabled: {
        id: 'disabled',
        defaultMessage: 'Disabled'
        // defaultMessage: 'Не включена'
    },
    nickname: {
        id: 'nickname',
        defaultMessage: 'Nickname'
        // defaultMessage: 'Ник'
    },
    password: {
        id: 'password',
        defaultMessage: 'Password'
        // defaultMessage: 'Пароль'
    },
    twoFactorAuth: {
        id: 'twoFactorAuth',
        defaultMessage: 'Two factor auth'
        // defaultMessage: 'Двухфакторная аутентификация'
    }
});
