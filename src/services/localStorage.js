import logger from 'services/logger';

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

class DummyStorage {
  getItem(key) {
    return this[key] || null;
  }

  setItem(key, value) {
    this[key] = value;
  }

  removeItem(key) {
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
