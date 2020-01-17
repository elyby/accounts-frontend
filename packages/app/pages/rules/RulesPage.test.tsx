import React, { ComponentProps } from 'react';
import sinon from 'sinon';
import expect from 'app/test/unexpected';
import { shallow, ShallowWrapper } from 'enzyme';

import RulesPage from './RulesPage';

type RulesPageShallowType = ShallowWrapper<
  ComponentProps<typeof RulesPage>,
  any,
  RulesPage
>;

describe('RulesPage', () => {
  describe('#onRuleClick()', () => {
    const id = 'rule-1-2';
    const pathname = '/foo';
    const search = '?bar';
    let page: RulesPageShallowType;
    let replace: Function;

    beforeEach(() => {
      replace = sinon.stub().named('history.replace');

      page = shallow(
        <RulesPage
          location={{ pathname, search } as any}
          history={{ replace }}
        />,
      );
    });

    it('should update location on rule click', () => {
      const expectedUrl = `/foo?bar#${id}`;

      page.find(`#${id}`).simulate('click', {
        target: document.createElement('li'),

        currentTarget: {
          id,
        },
      });

      expect(replace, 'to have a call satisfying', [expectedUrl]);
    });

    it('should not update location if link was clicked', () => {
      page.find(`#${id}`).simulate('click', {
        target: document.createElement('a'),

        currentTarget: {
          id,
        },
      });

      expect(replace, 'was not called');
    });

    it('should not update location if defaultPrevented', () => {
      page.find(`#${id}`).simulate('click', {
        defaultPrevented: true,

        target: {
          tagName: 'li',
        },

        currentTarget: {
          id,
        },
      });

      expect(replace, 'was not called');
    });

    it('should not update location if no id', () => {
      page.find(`#${id}`).simulate('click', {
        target: {
          tagName: 'li',
        },

        currentTarget: {},
      });

      expect(replace, 'was not called');
    });
  });
});
