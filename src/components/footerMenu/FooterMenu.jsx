import React, { Component, PropTypes } from 'react';

import { Link } from 'react-router';
import { FormattedMessage as Message } from 'react-intl';

import { LangMenu } from 'components/langMenu';

import styles from './footerMenu.scss';
import messages from './footerMenu.intl.json';

class FooterMenu extends Component {
    static displayName = 'FooterMenu';

    static propTypes = {
        createPopup: PropTypes.func.isRequired
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

                <LangMenu />
            </div>
        );
    }

    onContact = (event) => {
        event.preventDefault();
        this.props.createPopup();
    };
}

import { connect } from 'react-redux';
import ContactForm from 'components/contact/ContactForm';
import { create as createPopup } from 'components/ui/popup/actions';

export default connect(null, {
    createPopup: () => createPopup(ContactForm)
})(FooterMenu);
