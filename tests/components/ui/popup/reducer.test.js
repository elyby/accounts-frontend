import reducer from 'components/ui/popup/reducer';
import {create, destroy} from 'components/ui/popup/actions';

describe('popup/reducer', () => {
    it('should have no popups by default', () => {
        const actual = reducer(undefined, {});

        expect(actual.popups).to.be.an('array');
        expect(actual.popups).to.be.empty;
    });

    describe('#create', () => {
        it('should create popup', () => {
            const actual = reducer(undefined, create({
                Popup: FakeComponent
            }));

            expect(actual.popups[0]).to.be.deep.equal({
                Popup: FakeComponent
            });
        });

        it('should support shortcut popup creation', () => {
            const actual = reducer(undefined, create(FakeComponent));

            expect(actual.popups[0]).to.be.deep.equal({
                Popup: FakeComponent
            });
        });

        it('should create multiple popups', () => {
            let actual = reducer(undefined, create({
                Popup: FakeComponent
            }));
            actual = reducer(actual, create({
                Popup: FakeComponent
            }));

            expect(actual.popups[1]).to.be.deep.equal({
                Popup: FakeComponent
            });
        });

        it('throws when no type provided', () => {
            expect(() => reducer(undefined, create())).to.throw('Popup is required');
        });
    });

    describe('#destroy', () => {
        let state;
        let popup;

        beforeEach(() => {
            state = reducer(state, create(FakeComponent));
            popup = state.popups[0];
        });

        it('should remove popup', () => {
            expect(state.popups).to.have.length(1);

            state = reducer(state, destroy(popup));

            expect(state.popups).to.have.length(0);
        });

        it('should not remove something, that it should not', () => {
            state = reducer(state, create({
                Popup: FakeComponent
            }));

            state = reducer(state, destroy(popup));

            expect(state.popups).to.have.length(1);
            expect(state.popups[0]).to.not.equal(popup);
        });
    });
});

function FakeComponent() {}
