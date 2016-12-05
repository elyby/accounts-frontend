import expect from 'unexpected';

describe('promise.prototype.finally', () => {
    it('should be invoked after promise resolved', () =>
        expect(new Promise((resolve) => {
            Promise.resolve().finally(resolve)
        }), 'to be fulfilled')
    );

    it('should be invoked after promise rejected', () =>
        expect(new Promise((resolve) => {
            Promise.reject().finally(resolve)
        }), 'to be fulfilled')
    );
});
