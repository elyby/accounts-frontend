import sinon from 'sinon';
import expect from 'unexpected';

import PromiseMiddlewareLayer from 'services/request/PromiseMiddlewareLayer';

describe('PromiseMiddlewareLayer', () => {
    describe('#add()', () => {
        let layer;

        beforeEach(() => {
            layer = new PromiseMiddlewareLayer();
        });

        it('should have no middlewares by default', () => {
            expect(layer.middlewares, 'to have length', 0);
        });

        it('should add middleware into layer', () => {
            layer.add({});

            expect(layer.middlewares, 'to have length', 1);
        });

        it('throws if middleware is not object', () => {
            expect(() => layer.add(1), 'to throw', 'A middleware must be an object');
        });
    });

    describe('#run()', () => {
        it('should return promise', () => {
            const layer = new PromiseMiddlewareLayer();

            expect(layer.run('then'), 'to be a', Promise);
        });

        testAction('then');
        testAction('catch');

        function testAction(name) {
            describe(`run('${name}')`, () => {
                it('should run middleware', () => {
                    const layer = new PromiseMiddlewareLayer();
                    const middleware = {
                        [name]: sinon.spy(() => Promise.resolve()).named(`middleware.${name}`)
                    };

                    layer.add(middleware);

                    return layer.run(name).then(() => {
                        expect(middleware[name], 'was called once');
                    });
                });

                it('should pass data', () => {
                    const layer = new PromiseMiddlewareLayer();
                    const middleware = {
                        [name]: sinon.spy(() => Promise.resolve()).named(`middleware.${name}`)
                    };
                    const data = {};

                    layer.add(middleware);

                    return layer.run(name, data).then(() => {
                        expect(middleware[name], 'to have a call satisfying', [data, undefined]);
                    });
                });

                it('should call multiple middlewares', () => {
                    const layer = new PromiseMiddlewareLayer();
                    const firstMethod = name === 'catch' ? 'reject' : 'resolve';
                    const middleware1 = {
                        [name]: sinon.spy(() => Promise[firstMethod]('new data')).named(`middleware1.${name}`)
                    };
                    const middleware2 = {
                        [name]: sinon.spy(() => Promise.resolve('the last data')).named(`middleware2.${name}`)
                    };

                    layer.add(middleware1);
                    layer.add(middleware2);

                    return layer.run(name).then((resp) => {
                        expect(middleware1[name], 'was called');
                        expect(middleware2[name], 'to have a call satisfying', ['new data', undefined]);
                        expect(resp, 'to equal', 'the last data');
                    });
                });
            });
        }

        it('should not call wrong actions', () => {
            const layer = new PromiseMiddlewareLayer();
            const middleware = {
                then: () => {},
                wrongAction: sinon.spy(() => Promise.resolve()).named('middleware.wrongAction')
            };

            layer.add(middleware);

            return layer.run('then').then(() => {
                expect(middleware.wrongAction, 'was not called');
            });
        });

        it('should not call next catch middleware if previous was resolved', () => {
            const layer = new PromiseMiddlewareLayer();
            const middleware1 = {
                catch: () => Promise.resolve()
            };
            const middleware2 = {
                catch: sinon.spy(() => {}).named('middleware2.catch')
            };

            layer.add(middleware1);
            layer.add(middleware2);

            return layer.run('catch').then(() => {
                expect(middleware2.catch, 'was not called');
            });
        });

        it('should pass restart callback if any', () => {
            const layer = new PromiseMiddlewareLayer();
            const middleware = {
                catch: sinon.spy(() => Promise.resolve()).named('middleware.catch')
            };
            const callback = () => {};

            layer.add(middleware);

            return layer.run('catch', {}, callback).then(() => {
                expect(middleware.catch, 'to have a call satisfying', [
                    {},
                    expect.it('to be', callback)
                ]);
            });
        });
    });
});
