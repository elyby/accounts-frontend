import React from 'react';

import { shallow } from 'enzyme';

import ChangePassword from 'components/profile/changePassword/ChangePassword';

describe('<ChangePassword />', () => {
    it('renders two <Input /> components', () => {
        const component = shallow(<ChangePassword onSubmit={() => {}} />);

        expect(component.find('Input')).to.have.length(2);
    });


    it('should call onSubmit if passwords entered', () => {
        const onSubmit = sinon.spy();
        const component = shallow(<ChangePassword onSubmit={onSubmit} />);

        component.find('Form').simulate('submit');

        sinon.assert.calledOnce(onSubmit);
    });
});
