import expect from 'app/test/unexpected';
import sinon from 'sinon';

import BsodMiddleware from 'app/components/ui/bsod/BsodMiddleware';

describe('BsodMiddleware', () => {
  [500, 503, 555].forEach(code =>
    it(`should dispatch for ${code}`, () => {
      const resp = {
        originalResponse: { status: code },
      };

      const dispatchBsod = sinon.spy();
      const logger = { warn: sinon.spy() };

      const middleware = new BsodMiddleware(dispatchBsod, logger as any);

      return expect(middleware.catch(resp), 'to be rejected with', resp).then(
        () => {
          expect(dispatchBsod, 'was called');
          expect(logger.warn, 'to have a call satisfying', [
            'Unexpected response (BSoD)',
            { resp },
          ]);
        },
      );
    }),
  );

  [200, 404].forEach(code =>
    it(`should not dispatch for ${code}`, () => {
      const resp = {
        originalResponse: { status: code },
      };

      const dispatchBsod = sinon.spy();
      const logger = { warn: sinon.spy() };

      const middleware = new BsodMiddleware(dispatchBsod, logger as any);

      return expect(middleware.catch(resp), 'to be rejected with', resp).then(
        () => {
          expect(dispatchBsod, 'was not called');
          expect(logger.warn, 'was not called');
        },
      );
    }),
  );
});
