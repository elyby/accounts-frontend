import React from 'react';
import sinon from 'sinon';
import expect from 'app/test/unexpected';
import { render, fireEvent, createEvent, screen } from '@testing-library/react';
import { TestContextProvider } from 'app/shell';

import RulesPage from './RulesPage';

describe('RulesPage', () => {
  describe('#onRuleClick()', () => {
    const id = 'rule-1-2';
    const pathname = '/foo';
    const search = '?bar';
    let page: HTMLElement;
    let replace: Function;

    beforeEach(() => {
      replace = sinon.stub().named('history.replace');

      ({ container: page } = render(
        <TestContextProvider>
          <RulesPage
            location={{ pathname, search } as any}
            history={{ replace }}
          />
        </TestContextProvider>,
      ));
    });

    it('should update location on rule click', () => {
      const expectedUrl = `/foo?bar#${id}`;

      fireEvent.click(page.querySelector(`#${id}`) as HTMLElement);

      expect(replace, 'to have a call satisfying', [expectedUrl]);
    });

    it('should not update location if link was clicked', () => {
      fireEvent.click(screen.getByText('/register', { exact: false }));

      expect(replace, 'was not called');
    });

    it('should not update location if defaultPrevented', () => {
      const el = page.querySelector(`#${id}`) as HTMLElement;
      const event = createEvent.click(el);

      event.preventDefault();

      fireEvent(el, event);

      expect(replace, 'was not called');
    });

    it('should not update location if no id', () => {
      const el = page.querySelector(`#${id}`) as HTMLElement;

      el.id = '';

      fireEvent.click(el);

      expect(replace, 'was not called');
    });
  });
});
