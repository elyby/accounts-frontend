// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { FormattedMessage as Message } from 'react-intl';
import LanguageSwitcher from 'components/languageSwitcher';
import { create as createPopup } from 'components/ui/popup/actions';
import { ContactLink } from 'components/contact';

import styles from './footerMenu.scss';
import messages from './footerMenu.intl.json';

class FooterMenu extends Component<{
    createContactPopup: () => void,
    createLanguageSwitcherPopup: () => void,
}> {
    static displayName = 'FooterMenu';

    render() {
        return (
            <div className={styles.footerMenu}>
                <Link to="/rules">
                    <Message {...messages.rules} />
                </Link>
                {' | '}
                <ContactLink>
                    <Message {...messages.contactUs} />
                </ContactLink>
                {' | '}
                <Link to="/dev">
                    <Message {...messages.forDevelopers} />
                </Link>

                <div className={styles.langTriggerContainer}>
                    <a href="#" className={styles.langTrigger} onClick={this.onLanguageSwitcher}>
                        <span className={styles.langTriggerIcon} />
                        <Message {...messages.siteLanguage} />
                    </a>
                </div>
            </div>
        );
    }

    onLanguageSwitcher = (event: SyntheticMouseEvent<HTMLElement>) => {
        event.preventDefault();

        this.props.createLanguageSwitcherPopup();
    };
}

// mark this component, as not pure, because it is stateless,
// but should be re-rendered, if current lang was changed
export default connect(null, {
    createLanguageSwitcherPopup: () => createPopup(LanguageSwitcher),
}, null, {pure: false})(FooterMenu);
