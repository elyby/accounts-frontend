import type { Solution } from 'altcha-lib/types';
import * as Sentry from '@sentry/react';

import type { AltchaChallenge } from 'app/services/api/captcha';

type Outcome = 'solved' | 'error' | 'aborted';

/**
 * Non-standard APIs, which are available in the Chromium-based browsers only
 */
interface NavigatorHints {
    deviceMemory?: number;
    userAgentData?: {
        mobile: boolean;
    };
}

/**
 * Returns the lower bound of the power of 2 bucket, which the rate falls into. The bucket is the attribute,
 * by which the solving time can be grouped: unlike the rate itself, it has a low cardinality and,
 * unlike the fixed tiers, doesn't need to be calibrated
 */
export function getHashRateBucket(hashRate: number): number {
    return hashRate < 1 ? 0 : 2 ** Math.floor(Math.log2(hashRate));
}

function getDeviceAttributes(): Record<string, string | number | boolean | undefined> {
    const { hardwareConcurrency, deviceMemory, userAgentData } = navigator as Navigator & NavigatorHints;

    return {
        'device.mobile': userAgentData?.mobile,
        'device.cores': hardwareConcurrency || undefined,
        // Already rounded by the browser to one of 0.25, 0.5, 1, 2, 4, 8
        'device.memory': deviceMemory,
    };
}

/**
 * Reports the solving into the Sentry's metrics:
 * - altcha.solve_duration: the time, which depends on both the device and the luck;
 * - altcha.hash_rate: the checked counter's values per second, which depends on the device only,
 *   since the solution is found at a random position. So it's the device's benchmark.
 *
 * The timeout is reported as the error with the solve_duration of SOLVE_TIMEOUT
 */
export async function trackSolving(challenge: AltchaChallenge, signal: AbortSignal, solving: Promise<Solution>): Promise<Solution> {
    const startedAt = performance.now();
    // The browsers throttle the workers of the background tabs, so such measurements should be filtered out
    let wasHidden = document.visibilityState === 'hidden';
    const onVisibilityChange = () => {
        wasHidden ||= document.visibilityState === 'hidden';
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    const report = (outcome: Outcome, checked?: number) => {
        document.removeEventListener('visibilitychange', onVisibilityChange);

        const duration = performance.now() - startedAt;
        const attributes: Record<string, string | number | boolean | undefined> = {
            ...getDeviceAttributes(),
            'altcha.algorithm': challenge.parameters.algorithm,
            'altcha.cost': challenge.parameters.cost,
            'altcha.counter_max': challenge.parameters.data.counterMax,
            'altcha.outcome': outcome,
            'page.hidden': wasHidden,
        };

        if (checked && duration > 0) {
            const hashRate = checked / (duration / 1000);
            attributes['altcha.hash_rate_bucket'] = getHashRateBucket(hashRate);
            Sentry.metrics.distribution('altcha.hash_rate', hashRate, { attributes });
        }

        Sentry.metrics.distribution('altcha.solve_duration', duration, { unit: 'millisecond', attributes });
    };

    try {
        const solution = await solving;
        // The workers check the values in turns, so nearly all the values up to the solution are checked by then
        report('solved', solution.counter + 1);

        return solution;
    } catch (error) {
        report(signal.aborted ? 'aborted' : 'error');

        throw error;
    }
}
