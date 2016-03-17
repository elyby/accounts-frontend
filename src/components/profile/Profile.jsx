import React, { Component } from 'react';

import { FormattedMessage as Message, FormattedRelative as Relative } from 'react-intl';
import Helmet from 'react-helmet';

import { userShape } from 'components/user/User';

import ProfileField from './ProfileField';
import styles from './profile.scss';

export class Profile extends Component {
    static displayName = 'Profile';
    static propTypes = {
        user: userShape
    };

    render() {
        const { user } = this.props;

        const pageTitle = 'Настройки аккаунта Ely.by';

        return (
            <div className={styles.container}>
                <Helmet title={pageTitle} />
                <h2 className={styles.title}>
                    {pageTitle}
                </h2>

                <div className={styles.content}>
                    <div className={styles.description}>
                        Благодаря аккаунту Ely.by вы можете получить доступ ко многим ресурсам, связанным с Minecraft.
                        Берегите свой аккаунт, используйте надёжный пароль и регулярно его меняйте.
                    </div>

                    <div className={styles.options}>
                        <div className={styles.item}>
                            <h3 className={styles.optionsTitle}>
                                Персональные данные
                            </h3>
                            <p className={styles.optionsDescription}>
                                Здесь вы можете сменить ключевые параметры вашего аккаунта. Обратите внимание, что для
                                всех действий необходимо подтверждение при помощи ввода пароля.
                            </p>
                        </div>

                        <ProfileField
                            label={'Ник'}
                            value={user.username}
                            warningMessage={'Найден аккаунт Mojang с таким же ником и, по правилам проекта, его владелец вправе потребовать восстановления контроля над ником.'}
                        />

                        <ProfileField
                            label={'E-mail'}
                            value={user.email}
                        />

                        <ProfileField
                            label={'Пароль'}
                            value={<span>Изменён <Relative value={user.passwordChangedAt * 1000} /></span>}
                            warningMessage={user.shouldChangePassword ? (
                                <span>
                                    Для пароля применяется старый алгоритм хэширования<br />
                                    Пожалуйста, смените пароль.
                                </span>
                            ) : ''}
                        />

                        <ProfileField
                            label={'Двухфакторная аутентификация'}
                            value={'Не включена'}
                        />

                        <ProfileField
                            label={'UUID'}
                            value={user.uuid}
                            readonly
                        />
                    </div>
                </div>
            </div>
        );
    }
}
