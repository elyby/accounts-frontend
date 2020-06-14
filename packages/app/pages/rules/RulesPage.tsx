import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { FormattedMessage as Message } from 'react-intl';
import { Helmet } from 'react-helmet-async';
import { FooterMenu } from 'app/components/footerMenu';
import appName from 'app/components/auth/appInfo/appName.intl';

import styles from './rules.scss';

const projectName = <Message {...appName} />;

import clsx from 'clsx';

const rules = [
    {
        title: <Message key="mainProvisions" defaultMessage="Main provisions" />,
        items: [
            <Message
                key="mainProvision1"
                defaultMessage="{name} service was created for the organization of safety access to Ely.by's users accounts, his partners and any side project that wish to use one of the our's services."
                values={{
                    name: <b>{projectName}</b>,
                }}
            />,
            <Message
                key="mainProvision2"
                defaultMessage="We (here and in the next points) — Ely.by project developers team that make creating qualitative services for Minecraft community."
            />,
            <Message
                key="mainProvision3"
                defaultMessage="Ely.by is side project, that has nothing to do with Mojang and Microsoft companies. We don't provide support to Minecraft premium accounts, and we have nothing to do with servers that use or don't use our services."
            />,
            <Message
                key="mainProvision4"
                defaultMessage="The registration of the users account at server is free. Account creation Ely.by is only possible at that page {link}."
                values={{
                    link: <Link to="/register">https://account.ely.by/register</Link>,
                }}
            />,
        ],
    },
    {
        title: <Message key="emailAndNickname" defaultMessage="E‑mail and nickname" />,
        items: [
            <Message
                key="emailAndNickname1"
                defaultMessage="Account registration with usage of temporary mail services is prohibited. We speak about services that gives random E‑mail in any quantity."
            />,
            <Message
                key="emailAndNickname2"
                defaultMessage="We try to counteract it, but if you succesed in registration of account with usage of temporary mail services, there wont be any technical support for it and later, during of update of ours filters, account will be blocked with your nickname."
            />,
            <Message
                key="emailAndNickname3"
                defaultMessage="There are no any moral restrictions for users nickname that will be used in game."
            />,
            <Message
                key="emailAndNickname4"
                defaultMessage="Nicknames, belonging to famous persons, can be released at their favor for requirement and proves of that persons."
            />,
            <Message
                key="emailAndNickname5"
                defaultMessage="Minecraft premium account owner has right to require a control restore of his nickname an if it happened you have to change your nickname in 3 days or it will be done automatically."
            />,
            <Message
                key="emailAndNickname6"
                defaultMessage="If there is no any activity at your account during last 3 month, your nickname can be occupied by any user."
            />,
            <Message
                key="emailAndNickname7"
                defaultMessage="We aren't responsible for losing your game progress at servers if it was result of nickname changing, including changes on our demand."
            />,
        ],
    },
    {
        title: (
            <Message
                key="elyAccountsAsService"
                defaultMessage="{name} as service"
                values={{
                    name: projectName,
                }}
            />
        ),
        description: (
            <div>
                <p>
                    <Message
                        key="elyAccountsAsServiceDesc1"
                        defaultMessage="{name} has free providing to any project, that interested in it usage for Minecraft."
                        values={{
                            name: <b>{projectName}</b>,
                        }}
                    />
                </p>
                <p>
                    <Message
                        key="elyAccountsAsServiceDesc2"
                        defaultMessage="Despite we do our utmost to provide fast and stable work of service, we are not saved from DDOS-attack, hosters links work interruptions, electricity disorders or any cases, that impossible to be predicted. For avoiding possible incomprehension, we obliged to discuss next agreements, that will work in case of situations mentioned before:"
                    />
                </p>
            </div>
        ),
        items: [
            <Message
                key="elyAccountsAsService1"
                defaultMessage="We don't have any guarantee about fault free work time of this service."
            />,
            <Message
                key="elyAccountsAsService2"
                defaultMessage="We are not responsible for delays and lost income as the result of ours service inoperability."
            />,
        ],
    },
];

export default class RulesPage extends Component<{
    location: {
        pathname: string;
        search: string;
        hash: string;
    };

    history: {
        replace: Function;
    };
}> {
    render() {
        let { hash } = this.props.location;

        if (hash) {
            hash = hash.substring(1);
        }

        return (
            <div>
                <Message key="title" defaultMessage="Site rules">
                    {(pageTitle) => <Helmet title={pageTitle as string} />}
                </Message>

                <div className={styles.rules}>
                    {rules.map((block, sectionIndex) => (
                        <div className={styles.rulesSection} key={sectionIndex}>
                            <h2
                                className={clsx(styles.rulesSectionTitle, {
                                    [styles.target]: RulesPage.getTitleHash(sectionIndex) === hash,
                                })}
                                id={RulesPage.getTitleHash(sectionIndex)}
                            >
                                {block.title}
                            </h2>

                            <div className={styles.rulesBody}>
                                {block.description ? (
                                    <div className={styles.blockDescription}>{block.description}</div>
                                ) : (
                                    ''
                                )}
                                <ol className={styles.rulesList}>
                                    {block.items.map((item, ruleIndex) => (
                                        <li
                                            className={clsx(styles.rulesItem, {
                                                [styles.target]:
                                                    RulesPage.getRuleHash(sectionIndex, ruleIndex) === hash,
                                            })}
                                            key={ruleIndex}
                                            id={RulesPage.getRuleHash(sectionIndex, ruleIndex)}
                                            onClick={this.onRuleClick.bind(this)}
                                        >
                                            {item}
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        </div>
                    ))}
                </div>
                <div className={styles.footer}>
                    <FooterMenu />
                </div>
            </div>
        );
    }

    onRuleClick(event: React.SyntheticEvent<HTMLElement>) {
        if (event.defaultPrevented || !event.currentTarget.id || event.target instanceof HTMLAnchorElement) {
            // some-one have already processed this event or it is a link
            return;
        }

        const { id } = event.currentTarget;
        const newPath = `${this.props.location.pathname}${this.props.location.search}#${id}`;

        this.props.history.replace(newPath);
    }

    static getTitleHash(sectionIndex: number) {
        return `rule-${sectionIndex + 1}`;
    }

    static getRuleHash(sectionIndex: number, ruleIndex: number) {
        return `${RulesPage.getTitleHash(sectionIndex)}-${ruleIndex + 1}`;
    }
}
