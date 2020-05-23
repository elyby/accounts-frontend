import sinon from 'sinon';
import uxpect from 'app/test/unexpected';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import React from 'react';

import { PopupStack } from './PopupStack';

function DummyPopup({ onClose }: Record<string, any>) {
    return (
        <div>
            <button type="button" onClick={onClose}>
                close
            </button>
        </div>
    );
}

describe('<PopupStack />', () => {
    it('renders all popup components', () => {
        const props: any = {
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

        render(<PopupStack {...props} />);

        const popups = screen.getAllByRole('dialog');

        uxpect(popups, 'to have length', 2);
    });

    it('should hide popup, when onClose called', async () => {
        const destroy = sinon.stub().named('props.destroy');
        const props: any = {
            popups: [
                {
                    Popup: DummyPopup,
                },
            ],
            destroy,
        };

        const { rerender } = render(<PopupStack {...props} />);

        fireEvent.click(screen.getByRole('button', { name: 'close' }));

        uxpect(destroy, 'was called once');
        uxpect(destroy, 'to have a call satisfying', [uxpect.it('to be', props.popups[0])]);

        rerender(<PopupStack popups={[]} destroy={destroy} />);

        await waitFor(() => {
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });
    });

    it('should hide popup, when overlay clicked', () => {
        const props: any = {
            destroy: sinon.stub().named('props.destroy'),
            popups: [
                {
                    Popup: DummyPopup,
                },
            ],
        };

        render(<PopupStack {...props} />);

        fireEvent.click(screen.getByRole('dialog'));

        uxpect(props.destroy, 'was called once');
    });

    it('should not hide popup on overlay click if disableOverlayClose', () => {
        const props: any = {
            destroy: sinon.stub().named('props.destroy'),
            popups: [
                {
                    Popup: DummyPopup,
                    disableOverlayClose: true,
                },
            ],
        };

        render(<PopupStack {...props} />);

        fireEvent.click(screen.getByRole('dialog'));

        uxpect(props.destroy, 'was not called');
    });

    it('should hide popup, when esc pressed', () => {
        const props: any = {
            destroy: sinon.stub().named('props.destroy'),
            popups: [
                {
                    Popup: DummyPopup,
                },
            ],
        };

        render(<PopupStack {...props} />);

        const event = new Event('keyup');
        // @ts-ignore
        event.which = 27;
        document.dispatchEvent(event);

        uxpect(props.destroy, 'was called once');
    });

    it('should hide first popup in stack if esc pressed', () => {
        const props: any = {
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

        render(<PopupStack {...props} />);

        const event = new Event('keyup');
        // @ts-ignore
        event.which = 27;
        document.dispatchEvent(event);

        uxpect(props.destroy, 'was called once');
        uxpect(props.destroy, 'to have a call satisfying', [uxpect.it('to be', props.popups[1])]);
    });

    it('should NOT hide popup on esc pressed if disableOverlayClose', () => {
        const props: any = {
            destroy: sinon.stub().named('props.destroy'),
            popups: [
                {
                    Popup: DummyPopup,
                    disableOverlayClose: true,
                },
            ],
        };

        render(<PopupStack {...props} />);

        const event = new Event('keyup');
        // @ts-ignore
        event.which = 27;
        document.dispatchEvent(event);

        uxpect(props.destroy, 'was not called');
    });
});
