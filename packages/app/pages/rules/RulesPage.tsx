import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { FormattedMessage as Message } from 'react-intl';
import { Helmet } from 'react-helmet-async';
import { FooterMenu } from 'app/components/footerMenu';
import appInfo from 'app/components/auth/appInfo/AppInfo.intl.json';

import styles from './rules.scss';
import messages from './RulesPage.intl.json';

const projectName = <Message {...appInfo.appName} />;

import clsx from 'clsx';

const rules = [
  {
    title: <Message {...messages.mainProvisions} />,
    items: [
      <Message
        key="0"
        {...messages.mainProvision1}
        values={{
          name: <b>{projectName}</b>,
        }}
      />,
      <Message key="1" {...messages.mainProvision2} />,
      <Message key="2" {...messages.mainProvision3} />,
      <Message
        key="3"
        {...messages.mainProvision4}
        values={{
          link: <Link to="/register">https://account.ely.by/register</Link>,
        }}
      />,
    ],
  },
  {
    title: <Message {...messages.emailAndNickname} />,
    items: [
      <Message key="0" {...messages.emailAndNickname1} />,
      <Message key="1" {...messages.emailAndNickname2} />,
      <Message key="2" {...messages.emailAndNickname3} />,
      <Message key="3" {...messages.emailAndNickname4} />,
      <Message key="4" {...messages.emailAndNickname5} />,
      <Message key="5" {...messages.emailAndNickname6} />,
      <Message key="6" {...messages.emailAndNickname7} />,
    ],
  },
  {
    title: (
      <Message
        {...messages.elyAccountsAsService}
        values={{
          name: projectName,
        }}
      />
    ),
    description: (
      <div>
        <p>
          <Message
            {...messages.elyAccountsAsServiceDesc1}
            values={{
              name: <b>{projectName}</b>,
            }}
          />
        </p>
        <p>
          <Message {...messages.elyAccountsAsServiceDesc2} />
        </p>
      </div>
    ),
    items: [
      <Message key="0" {...messages.elyAccountsAsService1} />,
      <Message key="1" {...messages.elyAccountsAsService2} />,
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
        <Message {...messages.title}>
          {pageTitle => <Helmet title={pageTitle as string} />}
        </Message>

        <div className={styles.rules}>
          {rules.map((block, sectionIndex) => (
            <div className={styles.rulesSection} key={sectionIndex}>
              <h2
                className={clsx(styles.rulesSectionTitle, {
                  [styles.target]:
                    RulesPage.getTitleHash(sectionIndex) === hash,
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
                ) : (
                  ''
                )}
                <ol className={styles.rulesList}>
                  {block.items.map((item, ruleIndex) => (
                    <li
                      className={clsx(styles.rulesItem, {
                        [styles.target]:
                          RulesPage.getRuleHash(sectionIndex, ruleIndex) ===
                          hash,
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
    if (
      event.defaultPrevented ||
      !event.currentTarget.id ||
      event.target instanceof HTMLAnchorElement
    ) {
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
