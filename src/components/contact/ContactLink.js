// @flow
import React from 'react';
import { connect } from 'react-redux';
import { create as createPopup } from 'components/ui/popup/actions';
import ContactForm from './ContactForm';

function ContactLink({createContactPopup, ...props}: {
    createContactPopup: () => void,
    props: Object
}) {
    return (
        <a href="#" onClick={(event) => {
            event.preventDefault();

            createContactPopup();
        }} {...props} />
    );
}

export default connect(null, {
    createContactPopup: () => createPopup(ContactForm),
})(ContactLink);
