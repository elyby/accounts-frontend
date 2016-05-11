import React from 'react';

import { shallow } from 'enzyme';

import { PopupStack } from 'components/ui/popup/PopupStack';

function DummyPopup() {}

describe('<PopupStack />', () => {
    it('renders all popup components', () => {
        const props = {
            destroy: () => {},
            popups: [
                {
                    type: DummyPopup
                },
                {
                    type: DummyPopup
                }
            ]
        };
        const component = shallow(<PopupStack {...props} />);

        expect(component.find(DummyPopup)).to.have.length(2);
    });

    it('should pass provided props', () => {
        const expectedProps = {
            foo: 'bar'
        };

        const props = {
            destroy: () => {},
            popups: [
                {
                    type: DummyPopup,
                    props: expectedProps
                }
            ]
        };
        const component = shallow(<PopupStack {...props} />);

        expect(component.find(DummyPopup).prop('foo')).to.be.equal(expectedProps.foo);
    });

    it('should use props as proxy if it is function', () => {
        const expectedProps = {
            foo: 'bar'
        };

        const props = {
            destroy: () => {},
            popups: [
                {
                    type: DummyPopup,
                    props: (props) => {
                        expect(props).to.have.property('onClose');

                        return expectedProps;
                    }
                }
            ]
        };
        const component = shallow(<PopupStack {...props} />);

        expect(component.find(DummyPopup).props()).to.be.deep.equal(expectedProps);
    });

    it('should hide popup, when onClose called', () => {
        const props = {
            popups: [
                {
                    type: DummyPopup
                },
                {
                    type: DummyPopup
                }
            ],
            destroy: sinon.stub()
        };
        const component = shallow(<PopupStack {...props} />);

        component.find(DummyPopup).last().prop('onClose')();

        sinon.assert.calledOnce(props.destroy);
        sinon.assert.calledWith(props.destroy, sinon.match.same(props.popups[1]));
    });
});
