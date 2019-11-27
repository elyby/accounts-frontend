// @flow
import type { ElementConfig } from 'react';
import React from 'react';
import { connect } from 'react-redux';
import { create as createPopup } from 'components/ui/popup/actions';
import ContactForm from './ContactForm';

type OwnProps = $Exact<ElementConfig<'a'>>;

type Props = {
  ...OwnProps,
  createContactPopup: () => void,
};

function ContactLink({ createContactPopup, ...props }: Props) {
  return (
    <a
      href="#"
      data-e2e-button="feedbackPopup"
      onClick={event => {
        event.preventDefault();

        createContactPopup();
      }}
      {...props}
    />
  );
}

export default connect<Props, OwnProps, _, _, _, _>(null, {
  createContactPopup: () => createPopup({ Popup: ContactForm }),
})(ContactLink);
