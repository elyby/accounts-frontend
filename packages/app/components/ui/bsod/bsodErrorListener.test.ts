import expect from 'app/test/unexpected';
import sinon from 'sinon';

import createBsodErrorListener from 'app/components/ui/bsod/bsodErrorListener';
import { ApiError, InternalServerError } from 'app/services/request';

describe('bsodErrorListener', () => {
    [500, 503, 555].forEach((code) =>
        it(`should dispatch for ${code}`, () => {
            const resp = new InternalServerError(new Response('{}', { status: code }));

            const dispatchBsod = sinon.spy();
            const logger = { warn: sinon.spy() };

            createBsodErrorListener(dispatchBsod, logger as any)(resp);

            expect(dispatchBsod, 'was called');
            expect(logger.warn, 'to have a call satisfying', [expect.it('to begin with', 'BSoD'), { resp }]);
        }),
    );

    it('should dispatch for invalid json', () => {
        const resp = new InternalServerError(new Response('foo'), 'Unexpected token');

        const dispatchBsod = sinon.spy();
        const logger = { warn: sinon.spy() };

        createBsodErrorListener(dispatchBsod, logger as any)(resp);

        expect(dispatchBsod, 'was called');
        expect(logger.warn, 'to have a call satisfying', ['BSoD: Unexpected token', { resp }]);
    });

    [400, 401, 404].forEach((code) =>
        it(`should not dispatch for ${code}`, () => {
            const resp = new ApiError(new Response('{}', { status: code }), {});

            const dispatchBsod = sinon.spy();
            const logger = { warn: sinon.spy() };

            createBsodErrorListener(dispatchBsod, logger as any)(resp);

            expect(dispatchBsod, 'was not called');
            expect(logger.warn, 'was not called');
        }),
    );
});
