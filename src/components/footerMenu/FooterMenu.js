import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { Link } from 'react-router-dom';
import { FormattedMessage as Message } from 'react-intl';

import styles from './footerMenu.scss';
import messages from './footerMenu.intl.json';

class FooterMenu extends Component {
    static displayName = 'FooterMenu';

    static propTypes = {
        createContactPopup: PropTypes.func.isRequired,
        createLanguageSwitcherPopup: PropTypes.func.isRequired,
    };

    render() {
        return (
            <div className={styles.footerMenu}>
                <Link to="/rules">
                    <Message {...messages.rules} />
                </Link>
                {' | '}
                <a href="#" onClick={this.onContact}>
                    <Message {...messages.contactUs} />
                </a>

                <div className={styles.langTriggerContainer}>
                    <a href="#" className={styles.langTrigger} onClick={this.onLanguageSwitcher}>
                        <span className={styles.langTriggerIcon} />
                        <Message {...messages.siteLanguage} />
                    </a>
                </div>
            </div>
        );
    }

    onContact = (event) => {
        event.preventDefault();
        this.props.createContactPopup();
    };

    onLanguageSwitcher = (event) => {
        event.preventDefault();
        this.props.createLanguageSwitcherPopup();
    };
}

import { connect } from 'react-redux';
import ContactForm from 'components/contact/ContactForm';
import LanguageSwitcher from 'components/languageSwitcher/LanguageSwitcher';
import { create as createPopup } from 'components/ui/popup/actions';

// mark this component, as not pure, because it is stateless,
// but should be re-rendered, if current lang was changed
export default connect(null, {
    createContactPopup: () => createPopup(ContactForm),
    createLanguageSwitcherPopup: () => createPopup(LanguageSwitcher),
}, null, {pure: false})(FooterMenu);
