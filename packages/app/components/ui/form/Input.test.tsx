import React from 'react';
import { mount } from 'enzyme';
import expect from 'app/test/unexpected';
import { IntlProvider } from 'react-intl';

import Input from './Input';

describe('Input', () => {
  it('should return input value', () => {
    let component: any;

    const wrapper = mount(
      <IntlProvider locale="en" defaultLocale="en">
        <Input
          defaultValue="foo"
          name="test"
          ref={el => {
            component = el;
          }}
        />
      </IntlProvider>,
    );

    expect(
      wrapper.find('input[name="test"]').getDOMNode().value,
      'to equal',
      'foo',
    );
    expect(component.getValue(), 'to equal', 'foo');
  });
});
