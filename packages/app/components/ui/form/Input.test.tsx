import React from 'react';
import { render, screen } from '@testing-library/react';
import expect from 'app/test/unexpected';
import { IntlProvider } from 'react-intl';

import Input from './Input';

describe('Input', () => {
  it('should return input value', () => {
    let component: Input | null = null;

    render(
      <IntlProvider locale="en" defaultLocale="en">
        <Input
          defaultValue="foo"
          name="test"
          ref={(el) => {
            component = el;
          }}
        />
      </IntlProvider>,
    );

    expect(screen.getByDisplayValue('foo'), 'to be a', HTMLElement);
    expect(component && (component as Input).getValue(), 'to equal', 'foo');
  });
});
