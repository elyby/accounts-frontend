import sinon from 'sinon';
import expect from 'test/unexpected';

import React from 'react';

import { shallow, mount } from 'enzyme';

import { PopupStack } from 'components/ui/popup/PopupStack';
import styles from 'components/ui/popup/popup.scss';

function DummyPopup() {
  return null;
}

describe('<PopupStack />', () => {
  it('renders all popup components', () => {
    const props = {
      destroy: () => {},
      popups: [
        {
          Popup: DummyPopup,
        },
        {
          Popup: DummyPopup,
        },
      ],
    };
    const component = shallow(<PopupStack {...props} />);

    expect(component.find(DummyPopup), 'to satisfy', { length: 2 });
  });

  it('should pass onClose as props', () => {
    const expectedProps = {
      foo: 'bar',
    };

    const props = {
      destroy: () => {},
      popups: [
        {
          Popup: (props = {}) => {
            // eslint-disable-next-line
            expect(props.onClose, 'to be a', 'function');

            return <DummyPopup {...expectedProps} />;
          },
        },
      ],
    };
    const component = mount(<PopupStack {...props} />);

    const popup = component.find(DummyPopup);
    expect(popup, 'to satisfy', { length: 1 });
    expect(popup.props(), 'to equal', expectedProps);
  });

  it('should hide popup, when onClose called', () => {
    const props = {
      popups: [
        {
          Popup: DummyPopup,
        },
        {
          Popup: DummyPopup,
        },
      ],
      destroy: sinon.stub().named('props.destroy'),
    };
    const component = shallow(<PopupStack {...props} />);

    component
      .find(DummyPopup)
      .last()
      .prop('onClose')();

    expect(props.destroy, 'was called once');
    expect(props.destroy, 'to have a call satisfying', [
      expect.it('to be', props.popups[1]),
    ]);
  });

  it('should hide popup, when overlay clicked', () => {
    const preventDefault = sinon.stub().named('event.preventDefault');
    const props = {
      destroy: sinon.stub().named('props.destroy'),
      popups: [
        {
          Popup: DummyPopup,
        },
      ],
    };
    const component = shallow(<PopupStack {...props} />);

    const overlay = component.find(`.${styles.overlay}`);
    overlay.simulate('click', { target: 1, currentTarget: 1, preventDefault });

    expect(props.destroy, 'was called once');
    expect(preventDefault, 'was called once');
  });

  it('should hide popup on overlay click if disableOverlayClose', () => {
    const props = {
      destroy: sinon.stub().named('props.destroy'),
      popups: [
        {
          Popup: DummyPopup,
          disableOverlayClose: true,
        },
      ],
    };
    const component = shallow(<PopupStack {...props} />);

    const overlay = component.find(`.${styles.overlay}`);
    overlay.simulate('click', {
      target: 1,
      currentTarget: 1,
      preventDefault() {},
    });

    expect(props.destroy, 'was not called');
  });

  it('should hide popup, when esc pressed', () => {
    const props = {
      destroy: sinon.stub().named('props.destroy'),
      popups: [
        {
          Popup: DummyPopup,
        },
      ],
    };
    mount(<PopupStack {...props} />);

    const event = new Event('keyup');
    event.which = 27;
    document.dispatchEvent(event);

    expect(props.destroy, 'was called once');
  });

  it('should hide first popup in stack if esc pressed', () => {
    const props = {
      destroy: sinon.stub().named('props.destroy'),
      popups: [
        {
          Popup() {
            return null;
          },
        },
        {
          Popup: DummyPopup,
        },
      ],
    };
    mount(<PopupStack {...props} />);

    const event = new Event('keyup');
    event.which = 27;
    document.dispatchEvent(event);

    expect(props.destroy, 'was called once');
    expect(props.destroy, 'to have a call satisfying', [
      expect.it('to be', props.popups[1]),
    ]);
  });

  it('should NOT hide popup on esc pressed if disableOverlayClose', () => {
    const props = {
      destroy: sinon.stub().named('props.destroy'),
      popups: [
        {
          Popup: DummyPopup,
          disableOverlayClose: true,
        },
      ],
    };
    mount(<PopupStack {...props} />);

    const event = new Event('keyup');
    event.which = 27;
    document.dispatchEvent(event);

    expect(props.destroy, 'was not called');
  });
});
