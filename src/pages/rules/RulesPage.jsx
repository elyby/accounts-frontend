import React, { Component, PropTypes } from 'react';

import { Link } from 'react-router-dom';
import { FormattedMessage as Message } from 'react-intl';
import Helmet from 'react-helmet';

import { FooterMenu } from 'components/footerMenu';

import styles from './rules.scss';

import messages from './RulesPage.intl.json';
import appInfo from 'components/auth/appInfo/AppInfo.intl.json';

const projectName = <Message {...appInfo.appName} />;

import classNames from 'classnames';

const rules = [
    {
        title: <Message {...messages.mainProvisions} />,
        items: [
            <Message {...messages.mainProvision1} values={{
                name: (<b>{projectName}</b>)
            }} />,
            <Message {...messages.mainProvision2} />,
            <Message {...messages.mainProvision3} />,
            <Message {...messages.mainProvision4} values={{
                link: (<Link to="/register">https://account.ely.by/register</Link>)
            }} />
        ]
    },
    {
        title: <Message {...messages.emailAndNickname} />,
        items: [
            <Message {...messages.emailAndNickname1} />,
            <Message {...messages.emailAndNickname2} />,
            <Message {...messages.emailAndNickname3} />,
            <Message {...messages.emailAndNickname4} />,
            <Message {...messages.emailAndNickname5} />,
            <Message {...messages.emailAndNickname6} />,
            <Message {...messages.emailAndNickname7} />
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
            <Message {...messages.elyAccountsAsService1} />,
            <Message {...messages.elyAccountsAsService2} />
        ]
    }
];

export default class RulesPage extends Component {
    static propTypes = {
        location: PropTypes.shape({
            pathname: PropTypes.string,
            search: PropTypes.string,
            hash: PropTypes.string
        }).isRequired,
        history: PropTypes.shape({
            replace: PropTypes.func
        }).isRequired
    };

    render() {
        let {hash} = this.props.location;

        if (hash) {
            hash = hash.substring(1);
        }

        return (
            <div>
                <Message {...messages.title}>
                    {(pageTitle) => (
                        <Helmet title={pageTitle} />
                    )}
                </Message>

                <div className={styles.rules}>
                    {rules.map((block, sectionIndex) => (
                        <div className={styles.rulesSection} key={sectionIndex}>
                            <h2
                                className={classNames(styles.rulesSectionTitle, {
                                    [styles.target]: RulesPage.getTitleHash(sectionIndex) === hash
                                })}
                                id={RulesPage.getTitleHash(sectionIndex)}
                            >
                                {block.title}
                            </h2>

                            <div className={styles.rulesBody}>
                                {block.description ? (
                                    <div className={styles.blockDescription}>
                                        {block.description}
                                    </div>
                                ) : ''}
                                <ol className={styles.rulesList}>
                                    {block.items.map((item, ruleIndex) => (
                                        <li
                                            className={classNames(styles.rulesItem, {
                                                [styles.target]: RulesPage.getRuleHash(sectionIndex, ruleIndex) === hash
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

    onRuleClick(event) {
        if (event.defaultPrevented || event.target.tagName.toLowerCase() === 'a') {
            // some-one have already processed this event or it is a link
            return;
        }

        const {id} = event.currentTarget;
        const newPath = `${this.props.location.pathname}${this.props.location.search}#${id}`;

        this.props.history.replace(newPath);
    }

    static getTitleHash(sectionIndex) {
        return `rule-${sectionIndex + 1}`;
    }

    static getRuleHash(sectionIndex, ruleIndex) {
        return `${RulesPage.getTitleHash(sectionIndex)}-${ruleIndex + 1}`;
    }
}

RulesPage.displayName = 'RulesPage';
