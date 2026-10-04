import type { ErrorEvent, StackFrame } from '@sentry/react';

// Prefix that @sentry/webpack-plugin uses for the application key in the injected module metadata
const APP_KEY_PREFIX = '_sentryBundlerPluginAppKey:';

// @sentry/react wraps the component stack into an Error with this name and attaches it as the cause
// of the original error. Its "frames" always point to our components, even if the error came from a third-party script
const ERROR_BOUNDARY_TYPE_PREFIX = 'React ErrorBoundary ';

function hasAppKey(frame: StackFrame, applicationKey: string): boolean {
    const metadata = frame.module_metadata as Record<string, unknown> | undefined;

    return !!metadata && Object.keys(metadata).includes(APP_KEY_PREFIX + applicationKey);
}

/**
 * Sentry's thirdPartyErrorFilterIntegration checks the frames of all the exceptions in the event,
 * including the synthetic one, that @sentry/react creates from the component stack. Because of it,
 * the errors from injected scripts that are caught by an ErrorBoundary are never recognized as third-party.
 *
 * This function repeats the "exclusively contains third-party frames" check, but ignores the synthetic exception.
 * It relies on the module_metadata, which the integration applies to the frames before the event processors
 * and strips only before sending the envelope, so it must be called from the beforeSend
 *
 * AI generated
 */
export function isExclusivelyThirdPartyErrorBoundaryEvent(event: ErrorEvent, applicationKey: string): boolean {
    const values = event.exception?.values;

    if (!values || !values.some((value) => value.type?.startsWith(ERROR_BOUNDARY_TYPE_PREFIX))) {
        return false;
    }

    const frames = values
        .filter((value) => !value.type?.startsWith(ERROR_BOUNDARY_TYPE_PREFIX))
        .flatMap((value) => value.stacktrace?.frames ?? [])
        // The same criteria as in the integration: frames without a position can't be attributed to any bundle
        .filter((frame) => frame.filename && (frame.lineno !== undefined || frame.colno !== undefined));

    // Unlike the integration, don't treat an event without any usable frames as the third-party one
    return frames.length > 0
        && frames.every((frame) => !hasAppKey(frame, applicationKey));
}
