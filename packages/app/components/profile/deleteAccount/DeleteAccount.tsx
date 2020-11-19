import React, { ComponentType } from 'react';
import { FormattedMessage as Message } from 'react-intl';
import { Helmet } from 'react-helmet-async';

import { Button, Form } from 'app/components/ui/form';

import siteName from 'app/pages/root/siteName.intl';
import appName from 'app/components/auth/appInfo/appName.intl';

import { BackButton } from '../ProfileForm';
import styles from '../profileForm.scss';
import ownStyles from './deleteAccount.scss';

interface Props {
    onSubmit?: () => Promise<void>;
}

const DeleteAccount: ComponentType<Props> = ({ onSubmit }) => (
    <Form onSubmit={onSubmit}>
        <div className={styles.contentWithBackButton}>
            <BackButton />

            <div className={styles.form}>
                <div className={styles.formBody}>
                    <Message key="accountDeletionTitle" defaultMessage="Account deletion">
                        {(pageTitle) => (
                            <h3 className={styles.title}>
                                <Helmet title={pageTitle as string} />
                                {pageTitle}
                            </h3>
                        )}
                    </Message>

                    <div className={styles.formRow}>
                        <p className={styles.description}>
                            <Message
                                key="accountDeletionDescription1"
                                defaultMessage="You are about to delete your Ely.by account, which provides access to various Ely.by services. You won't be able to use them and all your account data will be lost."
                            />
                        </p>
                        <p className={styles.description}>
                            <Message
                                key="accountDeletionDescription2"
                                defaultMessage="You may also lose access to game servers and some third-party services if the Ely.by's authorization service was used to enter them."
                            />
                        </p>
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.sectionTitle}>
                            <Message key="dataToBeDeleted" defaultMessage="Data to be deleted:" />
                        </div>
                    </div>

                    <div className={ownStyles.removableDataRow}>
                        <div className={ownStyles.serviceName}>
                            {/* TODO: missing colon */}
                            <Message {...siteName} />
                        </div>
                        <div className={ownStyles.serviceContents}>
                            <ul>
                                <li>
                                    <Message key="posts" defaultMessage="Posts" tagName="span" />
                                </li>
                                <li>
                                    <Message key="friends" defaultMessage="Friends" tagName="span" />
                                </li>
                                <li>
                                    <Message key="directMessages" defaultMessage="Direct messages" tagName="span" />
                                </li>
                                <li>
                                    <Message key="cubes" defaultMessage="Cubes" tagName="span" />
                                </li>
                                <li>
                                    <Message
                                        key="serversForTheSSS"
                                        defaultMessage="Servers for the server skins system"
                                        tagName="span"
                                    />
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className={styles.delimiter} />

                    <div className={ownStyles.removableDataRow}>
                        <div className={ownStyles.serviceName}>
                            {/* TODO: missing colon */}
                            <Message {...appName} />
                        </div>
                        <div className={ownStyles.serviceContents}>
                            <ul>
                                <li>
                                    <Message key="usernameHistory" defaultMessage="Username history" tagName="span" />
                                </li>
                                <li>
                                    <Message key="oauthApps" defaultMessage="OAuth 2.0 applications" tagName="span" />
                                </li>
                                <li>
                                    <Message key="minecraftServers" defaultMessage="Minecraft servers" tagName="span" />
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className={styles.delimiter} />

                    <div className={ownStyles.removableDataRow}>
                        <div className={ownStyles.serviceName}>Chrly:</div>
                        <div className={ownStyles.serviceContents}>
                            <ul>
                                <li>
                                    <Message key="texturesData" defaultMessage="Textures data" tagName="span" />
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className={styles.delimiter} />

                    <div className={styles.formRow}>
                        <div className={styles.sectionTitle}>
                            <Message key="dataToBeImpersonalized" defaultMessage="Data to be impersonalized:" />
                        </div>
                    </div>

                    <div className={ownStyles.removableDataRow}>
                        <div className={ownStyles.serviceName}>
                            {/* TODO: missing colon */}
                            <Message {...siteName} />
                        </div>
                        <div className={ownStyles.serviceContents}>
                            <ul>
                                <li>
                                    <Message key="uploadedSkins" defaultMessage="Uploaded skins" tagName="span" />
                                </li>
                                <li>
                                    <Message key="comments" defaultMessage="Comments" tagName="span" />
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className={styles.formRow}>
                        <p className={styles.description}>
                            <Message
                                key="dataWontBeErasedImmediately"
                                defaultMessage="Data won't be erased immediately after account deletion. Within a week you'll be able to restore your account without losing any data."
                            />
                        </p>
                    </div>
                </div>

                <Button type="submit" color="red" block>
                    <Message key="deleteAccount" defaultMessage="Delete account" />
                </Button>
            </div>
        </div>
    </Form>
);

export default DeleteAccount;
