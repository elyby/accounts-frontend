import { solveChallenge } from 'altcha-lib';
import { deriveKey } from 'altcha-lib/algorithms/web/pbkdf2';
import type { DeriveKeyFunction, SolveChallengeOptions, Solution } from 'altcha-lib/types';

/**
 * The worker solves the challenge, checking every counterStep's value, starting from the counterStart
 */
export type WorkerRequest = Omit<SolveChallengeOptions, 'controller' | 'deriveKey'>;

export type WorkerResponse =
    | {
          type: 'progress';
          /**
           * The number of the counter's values, checked by this worker so far
           */
          checked: number;
      }
    | {
          type: 'solution';
          /**
           * Null when the time is out
           */
          solution: Solution | null;
      }
    | {
          type: 'error';
          message: string;
      };

/**
 * How often the worker reports the number of the checked counter's values
 */
const PROGRESS_INTERVAL = 100;

function respond(response: WorkerResponse): void {
    self.postMessage(response);
}

// The library's own handler (altcha-lib/workers/shared) reports the solution only,
// so the progress is counted by wrapping the key derivation, which is called once per the counter's value
self.onmessage = async ({ data }: MessageEvent<WorkerRequest>) => {
    let checked = 0;
    let reportedAt = 0;

    const countingDeriveKey: DeriveKeyFunction = (...args) => {
        checked++;

        const now = performance.now();

        if (now - reportedAt >= PROGRESS_INTERVAL) {
            reportedAt = now;
            respond({ type: 'progress', checked });
        }

        return deriveKey(...args);
    };

    try {
        const solution = await solveChallenge({ ...data, deriveKey: countingDeriveKey });
        respond({ type: 'solution', solution });
    } catch (error) {
        respond({ type: 'error', message: error instanceof Error ? error.message : String(error) });
    }
};
