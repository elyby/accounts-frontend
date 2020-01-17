import logger from 'app/services/logger';

let _hasStorage = false;

try {
  const test = 'test';
  window.localStorage.setItem(test, test);
  window.localStorage.removeItem(test);

  _hasStorage = true;
} catch (err) {
  // bad luck, no storage available
  logger.info('No storage available'); // log for statistic purposes
}

export function hasStorage() {
  return _hasStorage;
}

// TODO: work on
class DummyStorage implements Storage {
  getItem(key: string): string | null {
    return this[key] || null;
  }

  setItem(key: string, value: string): void {
    this[key] = value;
  }

  removeItem(key: string): void {
    Reflect.deleteProperty(this, key);
  }
}

export const localStorage = _hasStorage
  ? window.localStorage
  : new DummyStorage();

export const sessionStorage = _hasStorage
  ? window.sessionStorage
  : new DummyStorage();

export default localStorage;
