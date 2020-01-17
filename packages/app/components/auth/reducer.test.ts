import expect from 'app/test/unexpected';
import auth from './reducer';
import { setLogin, setAccountSwitcher } from './actions';

describe('components/auth/reducer', () => {
  describe('auth:setCredentials', () => {
    it('should set login', () => {
      const expectedLogin = 'foo';

      expect(
        auth(undefined, setLogin(expectedLogin)).credentials,
        'to satisfy',
        {
          login: expectedLogin,
        },
      );
    });
  });

  describe('auth:setAccountSwitcher', () => {
    it('should be enabled by default', () =>
      expect(auth(undefined, {} as any), 'to satisfy', {
        isSwitcherEnabled: true,
      }));

    it('should enable switcher', () => {
      const expectedValue = true;

      expect(auth(undefined, setAccountSwitcher(expectedValue)), 'to satisfy', {
        isSwitcherEnabled: expectedValue,
      });
    });

    it('should disable switcher', () => {
      const expectedValue = false;

      expect(auth(undefined, setAccountSwitcher(expectedValue)), 'to satisfy', {
        isSwitcherEnabled: expectedValue,
      });
    });
  });
});
