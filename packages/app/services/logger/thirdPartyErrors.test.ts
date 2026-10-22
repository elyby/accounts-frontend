import type { ErrorEvent, Exception, StackFrame } from '@sentry/react';

import { hasUserScriptFrames, isExclusivelyThirdPartyErrorBoundaryEvent } from './thirdPartyErrors';

const APP_KEY = 'test-app-key';

const ourFrame: StackFrame = {
    filename: 'https://account.ely.by/assets/main.js',
    lineno: 1,
    colno: 100,
    module_metadata: { [`_sentryBundlerPluginAppKey:${APP_KEY}`]: true },
};
const injectedFrame: StackFrame = { filename: '<anonymous>', lineno: 1, colno: 3085 };

function exception(type: string, frames: Array<StackFrame>): Exception {
    return { type, value: 'Maximum call stack size exceeded', stacktrace: { frames } };
}

function event(...values: Array<Exception>): ErrorEvent {
    return { type: undefined, exception: { values } };
}

describe('isExclusivelyThirdPartyErrorBoundaryEvent', () => {
    it('should recognize an injected script error caught by an ErrorBoundary (ACCOUNTS-FRONTEND-3KN)', () => {
        const result = isExclusivelyThirdPartyErrorBoundaryEvent(
            event(
                exception('React ErrorBoundary RangeError', [ourFrame, ourFrame]),
                exception('RangeError', [injectedFrame, injectedFrame]),
            ),
            APP_KEY,
        );

        expect(result).toBe(true);
    });

    it('should not recognize our own error caught by an ErrorBoundary', () => {
        const result = isExclusivelyThirdPartyErrorBoundaryEvent(
            event(
                exception('React ErrorBoundary TypeError', [ourFrame]),
                exception('TypeError', [injectedFrame, ourFrame]),
            ),
            APP_KEY,
        );

        expect(result).toBe(false);
    });

    it('should not recognize an ErrorBoundary event without usable frames', () => {
        const result = isExclusivelyThirdPartyErrorBoundaryEvent(
            event(
                exception('React ErrorBoundary Error', [ourFrame]),
                exception('Error', [{ filename: '<anonymous>' }]),
            ),
            APP_KEY,
        );

        expect(result).toBe(false);
    });

    it('should ignore events not caught by an ErrorBoundary', () => {
        const result = isExclusivelyThirdPartyErrorBoundaryEvent(
            event(exception('RangeError', [injectedFrame])),
            APP_KEY,
        );

        expect(result).toBe(false);
    });
});

describe('hasUserScriptFrames', () => {
    const sdkWrapperFrame: StackFrame = { filename: 'https://account.ely.by/app.js', lineno: 1, colno: 5000 };

    it('should recognize a user script calling a wrapped browser API (ACCOUNTS-FRONTEND-3NV)', () => {
        const userScriptFrame: StackFrame = {
            filename: 'userscript:GM-https://github.com/kelesmert/unwall/Unwall',
            lineno: 2527,
            colno: 14,
        };

        expect(hasUserScriptFrames(event(exception('TypeError', [userScriptFrame, sdkWrapperFrame])))).toBe(true);
    });

    it('should recognize a Tampermonkey script in Chrome', () => {
        const userScriptFrame: StackFrame = {
            filename: 'chrome-extension://dhdgffkkebhmkfjojejmpbldmpobfkfo/userscript.html?name=Script.user.js&id=1',
            lineno: 1,
            colno: 1,
        };

        expect(hasUserScriptFrames(event(exception('TypeError', [userScriptFrame, ourFrame])))).toBe(true);
    });

    it('should not recognize our own errors', () => {
        expect(hasUserScriptFrames(event(exception('TypeError', [ourFrame, sdkWrapperFrame])))).toBe(false);
    });
});
