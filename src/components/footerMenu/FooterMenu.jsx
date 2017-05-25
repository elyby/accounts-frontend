import React, { Component, PropTypes } from 'react';

import { Link } from 'react-router-dom';
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

// mark this component, as not pure, because it is stateless,
// but should be re-rendered, if current lang was changed
export default connect(null, {
    createPopup: () => createPopup(ContactForm)
}, null, {pure: false})(FooterMenu);
