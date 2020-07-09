import React, { ComponentProps, ComponentType } from 'react';
import { FormattedMessage as Message } from 'react-intl';
import clsx from 'clsx';

import Popup from 'app/components/ui/popup';

import styles from './sourceCodePopup.scss';

interface Props {
    onClose?: ComponentProps<typeof Popup>['onClose'];
}

const SourceCodePopup: ComponentType<Props> = ({ onClose }) => (
    <Popup
        title={<Message key="title" defaultMessage="Source code" />}
        wrapperClassName={styles.boundings}
        data-testid="source-code-popup"
        onClose={onClose}
    >
        <div className={styles.body}>
            <div className={styles.item}>
                <div className={styles.iconWrapper}>
                    <div className={styles.dbIcon} />
                </div>
                <div className={styles.contentWrapper}>
                    <a href="https://github.com/elyby/accounts" target="_blank" className={styles.itemLink}>
                        <div className={styles.projectTitle}>Backend</div>
                        <div className={styles.projectRepository}>
                            <span className={styles.githubIcon} />
                            elyby/accounts
                        </div>
                    </a>
                    <div className={styles.projectDescription}>
                        <Message
                            key="backendDescription"
                            defaultMessage="The service core and the linking point for all Ely.by's projects. Includes implementation of OAuth 2.0 protocol, authorization for Minecraft game servers and Mojang‑compatible API."
                        />
                    </div>
                </div>
            </div>

            <div className={styles.item}>
                <div className={styles.iconWrapper}>
                    <div className={clsx(styles.brushIcon, styles.blue)} />
                </div>
                <div className={styles.contentWrapper}>
                    <a href="https://github.com/elyby/accounts-frontend" target="_blank" className={styles.itemLink}>
                        <div className={clsx(styles.projectTitle, styles.blue)}>Frontend</div>
                        <div className={styles.projectRepository}>
                            <span className={styles.githubIcon} />
                            elyby/accounts-frontend
                        </div>
                    </a>
                    <div className={styles.projectDescription}>
                        <Message
                            key="frontendDescription"
                            defaultMessage="The interface that you're using right now. The mobile‑friendly UI has been translated into multiple languages and has the feature to access multiple accounts simultaneously."
                        />
                    </div>
                </div>
            </div>

            <div className={styles.item}>
                <div className={styles.iconWrapper}>
                    <div className={clsx(styles.envelopeIcon, styles.violet)} />
                </div>
                <div className={styles.contentWrapper}>
                    <a href="https://github.com/elyby/emails-renderer" target="_blank" className={styles.itemLink}>
                        <div className={clsx(styles.projectTitle, styles.violet)}>Mail rendering service</div>
                        <div className={styles.projectRepository}>
                            <span className={styles.githubIcon} />
                            elyby/emails-renderer
                        </div>
                    </a>
                    <div className={styles.projectDescription}>
                        <Message
                            key="mailRenderingServiceDescription"
                            defaultMessage="A support service that generates beautiful emails in your language. It allows us to use our favorite fonts even where they cannot be used =)"
                        />
                    </div>
                </div>
            </div>
        </div>

        <div className={styles.footer}>
            <div className={styles.heartIcon} />
            <div className={styles.footerTitle}>Open Source</div>
            <div className={styles.footerContent}>
                <Message
                    key="weLoveOpenSource"
                    defaultMessage="Ely.by is an open source project. You can find this and many of our other projects on our organization's page at <githubLink>GitHub</githubLink>. Contributors are welcome!"
                    values={{
                        githubLink: (text: string) => (
                            <a href="https://github.com/elyby/accounts" target="_blank">
                                {text}
                            </a>
                        ),
                    }}
                />
            </div>
        </div>
    </Popup>
);

export default SourceCodePopup;
