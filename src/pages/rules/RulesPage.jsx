import React from 'react';

import { Link } from 'react-router';
import { FormattedMessage as Message } from 'react-intl';

import { FooterMenu } from 'components/footerMenu';

import styles from './rules.scss';

import messages from './RulesPage.intl.json';
import appInfo from 'components/auth/appInfo/AppInfo.intl.json';

const projectName = <Message {...appInfo.appName} />;

const rules = [
    {
        title: <Message {...messages.mainProvisions} />,
        items: [
            (<Message {...messages.mainProvision1} values={{
                name: (<b>{projectName}</b>)
            }} />),
            (<Message {...messages.mainProvision2} />),
            (<Message {...messages.mainProvision3} />),
            (<Message {...messages.mainProvision4} values={{
                link: (<Link to={'/register'}>https://account.ely.by/register</Link>)
            }} />)
        ]
    },
    {
        title: <Message {...messages.emailAndNickname} />,
        items: [
            (<Message {...messages.emailAndNickname1} />),
            (<Message {...messages.emailAndNickname2} />),
            (<Message {...messages.emailAndNickname3} />),
            (<Message {...messages.emailAndNickname4} />),
            (<Message {...messages.emailAndNickname5} />),
            (<Message {...messages.emailAndNickname6} />),
            (<Message {...messages.emailAndNickname7} />)
        ]
    },
    {
        title: <Message {...messages.elyAccountsAsService} values={{
            name: projectName
        }} />,
        description: (<div>
            <p><Message {...messages.elyAccountsAsServiceDesc1} values={{
                name: (<b>{projectName}</b>)
            }} /></p>
            <p><Message {...messages.elyAccountsAsServiceDesc2} /></p>
        </div>),
        items: [
            (<Message {...messages.elyAccountsAsService1} />),
            (<Message {...messages.elyAccountsAsService2} />)
        ]
    }
];

export default function RulesPage() {
    return (
        <div>
            <div className={styles.rules}>
                {rules.map((block, sectionIndex) => (
                    <div className={styles.rulesSection} key={sectionIndex}>
                        <span id={`rule-${sectionIndex + 1}`} />
                        <h2 className={styles.rulesSectionTitle}>{block.title}</h2>

                        <div className={styles.rulesBody}>
                            {block.description ? (
                                <div className={styles.blockDescription}>
                                    {block.description}
                                </div>
                            ) : ''}
                            <ol className={styles.rulesList}>
                                {block.items.map((item, ruleIndex) => (
                                    <li className={styles.rulesItem} key={ruleIndex}>
                                        <span id={`rule-${sectionIndex + 1}-${ruleIndex + 1}`} />
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

RulesPage.displayName = 'RulesPage';
