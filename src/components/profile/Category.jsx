import React, { Component } from 'react';

import { FormattedMessage as Message, FormattedRelative as Relative } from 'react-intl';

import styles from './category.scss';

export class Category extends Component {
    static displayName = 'Logout';

    render() {
        var { user } = this.props;
        var changePassDate = Date.now() - (1000 * 60 * 60 * 24 * 30 * 3);

        return (
            <div>
                <h2 className={styles.title}>
                    Настройки аккаунта Ely.by
                </h2>
                <div className={styles.content}>
                    <div className={styles.description}>
                        Благодаря аккаунту Ely.by вы можете получить доступ ко многим ресурсам, связанным с Minecraft.
                        Берегите свой аккаунт, используйте надёжный пароль и регулярно его меняйте.
                    </div>

                    <div className={styles.options}>
                        <div className={styles.item}>
                            <h3 className={styles.optionsTitle}>Персональные данные</h3>
                            <p className={styles.optionsDescription}>
                                Здесь вы можете сменить ключевые параметры вашего аккаунта. Обратите внимание, что для
                                всех действий необходимо подтверждение при помощи ввода пароля.
                            </p>
                        </div>

                        <div className={styles.paramItem}>
                            <div className={styles.paramRow}>
                                <div className={styles.paramName}>Ник:</div>
                                <div className={styles.paramValue}>{user.username}</div>
                                <div className={styles.paramAction}>
                                    <a href="#">
                                        <span className={styles.paramEditIcon} />
                                    </a>
                                </div>
                            </div>
                            <div className={styles.paramMessage}>
                                Найден аккаунт Mojang с таким же ником и, по правилам проекта, его владелец вправе
                                потребовать восстановления контроля над ником.
                            </div>
                        </div>

                        <div className={styles.paramItem}>
                            <div className={styles.paramRow}>
                                <div className={styles.paramName}>E-mail:</div>
                                <div className={styles.paramValue}>{user.email}</div>
                                <div className={styles.paramAction}>
                                    <a href="#">
                                        <span className={styles.paramEditIcon} />
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className={styles.paramItem}>
                            <div className={styles.paramRow}>
                                <div className={styles.paramName}>Пароль:</div>
                                <div className={styles.paramValue}>
                                    Изменён <Relative value={changePassDate} />
                                </div>
                                <div className={styles.paramAction}>
                                    <a href="#">
                                        <span className={styles.paramEditIcon} />
                                    </a>
                                </div>
                            </div>
                            {user.shouldChangePassword ? (
                                <div className={styles.paramMessage}>
                                    Для пароля применяется старый алгоритм хэширования<br />
                                    Пожалуйста, смените пароль.
                                </div>
                            ) : ''}
                        </div>

                        <div className={styles.paramItem}>
                            <div className={styles.paramRow}>
                                <div className={styles.paramName}>Двухфакторная аутентификация:</div>
                                <div className={styles.paramValue}>Не включена</div>
                                <div className={styles.paramAction}>
                                    <a href="#">
                                        <span className={styles.paramEditIcon} />
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className={styles.paramItem}>
                            <div className={styles.paramRow}>
                                <div className={styles.paramName}>UUID:</div>
                                <div className={styles.uuidValue}>{user.uuid || 'df936908-b2e1-544d-96f8-2977ec213022'}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
