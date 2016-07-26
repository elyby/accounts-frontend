import React from 'react';

import { shallow, mount } from 'enzyme';

import { PopupStack } from 'components/ui/popup/PopupStack';
import styles from 'components/ui/popup/popup.scss';

function DummyPopup() {return null;}

describe('<PopupStack />', () => {
    it('renders all popup components', () => {
        const props = {
            destroy: () => {},
            popups: [
                {
                    Popup: DummyPopup
                },
                {
                    Popup: DummyPopup
                }
            ]
        };
        const component = shallow(<PopupStack {...props} />);

        expect(component.find(DummyPopup)).to.have.length(2);
    });

    it('should pass onClose as props', () => {
        const expectedProps = {
            foo: 'bar'
        };

        const props = {
            destroy: () => {},
            popups: [
                {
                    Popup: (props = {}) => {
                        expect(props.onClose).to.be.a('function');

                        return <DummyPopup {...expectedProps} />;
                    }
                }
            ]
        };
        const component = mount(<PopupStack {...props} />);

        const popup = component.find(DummyPopup);
        expect(popup).to.have.length(1);
        expect(popup.props()).to.deep.equal(expectedProps);
    });

    it('should hide popup, when onClose called', () => {
        const props = {
            popups: [
                {
                    Popup: DummyPopup
                },
                {
                    Popup: DummyPopup
                }
            ],
            destroy: sinon.stub()
        };
        const component = shallow(<PopupStack {...props} />);

        component.find(DummyPopup).last().prop('onClose')();

        sinon.assert.calledOnce(props.destroy);
        sinon.assert.calledWith(props.destroy, sinon.match.same(props.popups[1]));
    });

    it('should hide popup, when overlay clicked', () => {
        const preventDefault = sinon.stub();
        const props = {
            destroy: sinon.stub(),
            popups: [
                {
                    Popup: DummyPopup
                }
            ]
        };
        const component = shallow(<PopupStack {...props} />);

        const overlay = component.find(`.${styles.overlay}`);
        overlay.simulate('click', {target: 1, currentTarget: 1, preventDefault});

        sinon.assert.calledOnce(props.destroy);
        sinon.assert.calledOnce(preventDefault);
    });

    it('should hide popup on overlay click if disableOverlayClose', () => {
        const props = {
            destroy: sinon.stub(),
            popups: [
                {
                    Popup: DummyPopup,
                    disableOverlayClose: true
                }
            ]
        };
        const component = shallow(<PopupStack {...props} />);

        const overlay = component.find(`.${styles.overlay}`);
        overlay.simulate('click', {target: 1, currentTarget: 1, preventDefault() {}});

        sinon.assert.notCalled(props.destroy);
    });

    it('should hide popup, when esc pressed', () => {
        const props = {
            destroy: sinon.stub(),
            popups: [
                {
                    Popup: DummyPopup
                }
            ]
        };
        mount(<PopupStack {...props} />);

        const event = new Event('keyup');
        event.which = 27;
        document.dispatchEvent(event);

        sinon.assert.calledOnce(props.destroy);
    });

    it('should hide first popup in stack if esc pressed', () => {
        const props = {
            destroy: sinon.stub(),
            popups: [
                {
                    Popup() {return null;}
                },
                {
                    Popup: DummyPopup
                }
            ]
        };
        mount(<PopupStack {...props} />);

        const event = new Event('keyup');
        event.which = 27;
        document.dispatchEvent(event);

        sinon.assert.calledOnce(props.destroy);
        sinon.assert.calledWithExactly(props.destroy, props.popups[1]);
    });

    it('should NOT hide popup on esc pressed if disableOverlayClose', () => {
        const props = {
            destroy: sinon.stub(),
            popups: [
                {
                    Popup: DummyPopup,
                    disableOverlayClose: true
                }
            ]
        };
        mount(<PopupStack {...props} />);

        const event = new Event('keyup');
        event.which = 27;
        document.dispatchEvent(event);

        sinon.assert.notCalled(props.destroy);
    });
});
