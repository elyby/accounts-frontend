import React from 'react';
import expect from 'test/unexpected';
import sinon from 'sinon';
import { shallow, mount } from 'enzyme';
import { IntlProvider } from 'react-intl';
import feedback from 'services/api/feedback';
import { User } from 'components/user';

import { ContactForm } from './ContactForm';

describe('ContactForm', () => {
  describe('when rendered', () => {
    const user = {} as User;
    let component;

    beforeEach(() => {
      component = shallow(<ContactForm user={user} />);
    });

    [
      {
        type: 'Input',
        name: 'subject',
      },
      {
        type: 'Input',
        name: 'email',
      },
      {
        type: 'Dropdown',
        name: 'category',
      },
      {
        type: 'TextArea',
        name: 'message',
      },
    ].forEach(el => {
      it(`should have ${el.name} field`, () => {
        expect(component.find(`${el.type}[name="${el.name}"]`), 'to satisfy', {
          length: 1,
        });
      });
    });

    it('should contain Form', () => {
      expect(component.find('Form'), 'to satisfy', { length: 1 });
    });

    it('should contain submit Button', () => {
      expect(component.find('Button[type="submit"]'), 'to satisfy', {
        length: 1,
      });
    });
  });

  describe('when rendered with user', () => {
    const user = {
      email: 'foo@bar.com',
    } as User;
    let component;

    beforeEach(() => {
      component = shallow(<ContactForm user={user} />);
    });

    it('should render email field with user email', () => {
      expect(
        component.find('Input[name="email"]').prop('defaultValue'),
        'to equal',
        user.email,
      );
    });
  });

  describe('when email was successfully sent', () => {
    const user = {
      email: 'foo@bar.com',
    } as User;
    let component;

    beforeEach(() => {
      component = shallow(<ContactForm user={user} />);

      component.setState({ isSuccessfullySent: true });
    });

    it('should not contain Form', () => {
      expect(component.find('Form'), 'to satisfy', { length: 0 });
    });
  });

  xdescribe('validation', () => {
    const user = {
      email: 'foo@bar.com',
    } as User;
    let component;
    let wrapper;

    beforeEach(() => {
      // TODO: add polyfill for from validation for jsdom

      wrapper = mount(
        <IntlProvider locale="en" defaultLocale="en">
          <ContactForm user={user} ref={el => (component = el)} />
        </IntlProvider>,
      );
    });

    it('should require email, subject and message', () => {
      // wrapper.find('[type="submit"]').simulate('click');
      wrapper.find('form').simulate('submit');

      expect(component.form.hasErrors(), 'to be true');
    });
  });

  describe('when user submits form', () => {
    const user = {
      email: 'foo@bar.com',
    } as User;
    let component;
    let wrapper;
    const requestData = {
      email: user.email,
      subject: 'Test subject',
      message: 'Test message',
    };

    beforeEach(() => {
      sinon.stub(feedback, 'send');

      // TODO: add polyfill for from validation for jsdom
      if (!(Element.prototype as any).checkValidity) {
        (Element.prototype as any).checkValidity = () => true;
      }

      // TODO: try to rewrite with unexpected-react
      wrapper = mount(
        <IntlProvider locale="en" defaultLocale="en">
          <ContactForm user={user} ref={el => (component = el)} />
        </IntlProvider>,
      );

      wrapper.find('input[name="email"]').getDOMNode().value =
        requestData.email;
      wrapper.find('input[name="subject"]').getDOMNode().value =
        requestData.subject;
      wrapper.find('textarea[name="message"]').getDOMNode().value =
        requestData.message;
    });

    afterEach(() => {
      (feedback.send as any).restore();
    });

    xit('should call onSubmit', () => {
      sinon.stub(component, 'onSubmit');

      wrapper.find('form').simulate('submit');

      expect(component.onSubmit, 'was called');
    });

    it('should call send with required data', () => {
      (feedback.send as any).returns(Promise.resolve());

      component.onSubmit();

      expect(feedback.send, 'to have a call satisfying', [requestData]);
    });

    it('should set isSuccessfullySent', () => {
      (feedback.send as any).returns(Promise.resolve());

      return component
        .onSubmit()
        .then(() =>
          expect(component.state, 'to satisfy', { isSuccessfullySent: true }),
        );
    });

    it('should handle isLoading during request', () => {
      (feedback.send as any).returns(Promise.resolve());

      const promise = component.onSubmit();

      expect(component.state, 'to satisfy', { isLoading: true });

      return promise.then(() =>
        expect(component.state, 'to satisfy', { isLoading: false }),
      );
    });

    it('should render success message with user email', () => {
      (feedback.send as any).returns(Promise.resolve());

      return component
        .onSubmit()
        .then(() => expect(wrapper.text(), 'to contain', user.email));
    });
  });
});
