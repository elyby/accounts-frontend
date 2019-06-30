import React from 'react';
import expect from 'test/unexpected';
import sinon from 'sinon';

import { shallow } from 'enzyme';

import ChangePassword from 'components/profile/changePassword/ChangePassword';

describe('<ChangePassword />', () => {
    it('renders two <Input /> components', () => {
        const component = shallow(<ChangePassword onSubmit={() => {}} />);

        expect(component.find('Input'), 'to satisfy', {length: 2});
    });


    it('should call onSubmit if passwords entered', () => {
        const onSubmit = sinon.spy(() => ({catch: () => {}})).named('onSubmit');
        const component = shallow(<ChangePassword onSubmit={onSubmit} />);

        component.find('Form').simulate('submit');

        expect(onSubmit, 'was called');
    });
});
