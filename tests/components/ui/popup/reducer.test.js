import reducer from 'components/ui/popup/reducer';
import {create, destroy, register} from 'components/ui/popup/actions';

describe('popup/reducer', () => {
    it('should have empty pool by default', () => {
        const actual = reducer(undefined, {});

        expect(actual.pool).to.be.an('object');
        expect(actual.pool).to.be.empty;
    });

    it('should have no popups by default', () => {
        const actual = reducer(undefined, {});

        expect(actual.popups).to.be.an('array');
        expect(actual.popups).to.be.empty;
    });

    describe('#register', () => {
        it('should add popup components into pool', () => {
            const actual = reducer(undefined, register('foo', function() {}));

            expect(actual.pool.foo).to.be.a('function');
        });

        it('throws when no type or component provided', () => {
            expect(() => reducer(undefined, register()), 'type').to.throw('Type and component are required');
            expect(() => reducer(undefined, register('foo')), 'component').to.throw('Type and component are required');
        });
    });

    describe('#create', () => {
        it('should create popup', () => {
            const actual = reducer(undefined, create('foo'));

            expect(actual.popups[0]).to.be.deep.equal({
                type: 'foo',
                props: {}
            });
        });

        it('should store props', () => {
            const expectedProps = {foo: 'bar'};
            const actual = reducer(undefined, create('foo', expectedProps));

            expect(actual.popups[0]).to.be.deep.equal({
                type: 'foo',
                props: expectedProps
            });
        });

        it('should not remove existed popups', () => {
            let actual = reducer(undefined, create('foo'));
            actual = reducer(actual, create('foo2'));

            expect(actual.popups[1]).to.be.deep.equal({
                type: 'foo2',
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
            state = reducer(undefined, register('foo', () => {}));
            state = reducer(state, create('foo'));
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
