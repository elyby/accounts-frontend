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

export function hasStorage(): boolean {
    return _hasStorage;
}

class DummyStorage implements Storage {
    // FIXME: we can't use this declaration because it breaks react-hot-loader/babel
    // [key: string]: any;

    get length() {
        return Object.keys(this).length;
    }

    getItem(key: string): string | null {
        // @ts-ignore
        return this[key] || null;
    }

    setItem(key: string, value: string): void {
        // @ts-ignore
        this[key] = value;
    }

    removeItem(key: string): void {
        Reflect.deleteProperty(this, key);
    }

    clear(): void {
        Object.keys(this).forEach(this.removeItem);
    }

    key(index: number): string | null {
        return Object.keys(this)[index] || null;
    }
}

export const localStorage = _hasStorage ? window.localStorage : new DummyStorage();

export const sessionStorage = _hasStorage ? window.sessionStorage : new DummyStorage();

export default localStorage;
