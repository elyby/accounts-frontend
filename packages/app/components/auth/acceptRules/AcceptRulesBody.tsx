import React from 'react';

import { FormattedMessage as Message } from 'react-intl';
import { Link } from 'react-router-dom';

import icons from 'app/components/ui/icons.scss';
import BaseAuthBody from 'app/components/auth/BaseAuthBody';
import appName from 'app/components/auth/appInfo/appName.intl';

import styles from './acceptRules.scss';

export default class AcceptRulesBody extends BaseAuthBody {
    static displayName = 'AcceptRulesBody';
    static panelId = 'acceptRules';

    render() {
        return (
            <div>
                {this.renderErrors()}

                <div className={styles.security}>
                    <span className={icons.lock} />
                </div>

                <p className={styles.descriptionText}>
                    <Message
                        key="description1"
                        defaultMessage="We have updated our {link}."
                        values={{
                            link: (
                                <Link to="/rules" target="_blank">
                                    <Message key="termsOfService" defaultMessage="terms of service" />
                                </Link>
                            ),
                        }}
                    />
                    <br />
                    <Message
                        key="description2"
                        defaultMessage="In order to continue using {name} service, you need to accept them."
                        values={{
                            name: <Message {...appName} />,
                        }}
                    />
                </p>
            </div>
        );
    }
}
