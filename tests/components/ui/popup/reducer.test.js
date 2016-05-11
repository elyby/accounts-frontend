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
            const actual = reducer(undefined, create(FakeComponent));

            expect(actual.popups[0]).to.be.deep.equal({
                type: FakeComponent,
                props: {}
            });
        });

        it('should store props', () => {
            const expectedProps = {foo: 'bar'};
            const actual = reducer(undefined, create(FakeComponent, expectedProps));

            expect(actual.popups[0]).to.be.deep.equal({
                type: FakeComponent,
                props: expectedProps
            });
        });

        it('should not remove existed popups', () => {
            let actual = reducer(undefined, create(FakeComponent));
            actual = reducer(actual, create(FakeComponent));

            expect(actual.popups[1]).to.be.deep.equal({
                type: FakeComponent,
                props: {}
            });
        });

        it('throws when no type provided', () => {
            expect(() => reducer(undefined, create())).to.throw('Popup type is required');
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
            state = reducer(state, create('foo'));

            state = reducer(state, destroy(popup));

            expect(state.popups).to.have.length(1);
            expect(state.popups[0]).to.not.equal(popup);
        });

        it('throws when no type provided', () => {
            expect(() => reducer(undefined, destroy({}))).to.throw('Popup type is required');
        });
    });
});

function FakeComponent() {}
