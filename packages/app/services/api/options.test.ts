import expect from 'app/test/unexpected';
import sinon from 'sinon';
import request from 'app/services/request';
import options from './options';

describe('services/api/options', () => {
  const expectedResp = { foo: 'bar' };

  beforeEach(() => {
    sinon
      .stub(request, 'get')
      .named('request.get')
      .returns(Promise.resolve(expectedResp));
  });

  afterEach(() => {
    (request.get as any).restore();
  });

  it('should request options without token', () =>
    options.get().then(resp => {
      expect(resp, 'to be', expectedResp);
      expect(request.get, 'to have a call satisfying', [
        '/api/options',
        {},
        { token: null },
      ]);
    }));

  it('should cache options', () =>
    // NOTE: this is bad practice, but we are relying on the state from
    // the previous test
    options.get().then(resp => {
      expect(resp, 'to be', expectedResp);
      expect(request.get, 'was not called');
    }));
});
