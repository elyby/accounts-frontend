import React from 'react';
import { connect } from 'react-redux';
import { create as createPopup } from 'app/components/ui/popup/actions';
import ContactForm from 'app/components/contact';

type Props = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    createContactPopup: () => void;
};

function ContactLink({ createContactPopup, ...props }: Props) {
    return (
        <a
            href="#"
            data-e2e-button="feedbackPopup"
            onClick={(event) => {
                event.preventDefault();

                createContactPopup();
            }}
            {...props}
        />
    );
}

export default connect(null, {
    createContactPopup: () => createPopup({ Popup: ContactForm }),
})(ContactLink);
