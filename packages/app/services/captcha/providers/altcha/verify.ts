import type { Solution } from 'altcha-lib/types';

import { type AltchaChallenge, getAltchaChallenge } from 'app/services/api/captcha';

import type { WorkerRequest, WorkerResponse } from './altcha.worker';
import { trackSolving } from './metrics';

/**
 * The timeout only prevents endless solving of a broken challenge, after which the user can try again
 */
const SOLVE_TIMEOUT = 60_000;

const MAX_CONCURRENCY = 8;

/**
 * The progress stays below the end until the solution is found: it may be found at any moment,
 * and the workers may check a bit more values than the limit
 */
const MAX_UNFINISHED_PROGRESS = 0.99;

function createWorker(algorithm: string): Worker {
    // The backend issues PBKDF2 challenges only. Other algorithms (Argon2id, Scrypt) need WASM
    // implementations, which aren't bundled to keep the worker small
    if (!algorithm.startsWith('PBKDF2/')) {
        throw new Error(`Unsupported ALTCHA algorithm: ${algorithm}`);
    }

    // Webpack uses the worker's name as the name of its chunk
    return new Worker(new URL('./altcha.worker.ts', import.meta.url), { name: 'altcha-worker' });
}

export interface VerifyResult {
    /**
     * The value for the captcha field
     */
    token: string;
    /**
     * The client clock's timestamp (ms), after which the backend will reject the token
     */
    expiresAt: number;
}

/**
 * @param progress from 0 to 1, but never reaches 1 before the solution is found
 */
export type ProgressListener = (progress: number) => void;

export type Verifier = (challengeUrl: string, signal: AbortSignal, onProgress?: ProgressListener) => Promise<VerifyResult>;

/**
 * Requests a new challenge, solves it in Web Workers and returns the payload for the backend.
 * Being aborted, rejects with the signal's reason
 */
const verify: Verifier = async (challengeUrl, signal, onProgress) => {
    const { response, ...challenge } = await getAltchaChallenge(challengeUrl);
    const receivedAt = Date.now();
    signal.throwIfAborted();

    const { counterMax } = challenge.parameters.data;
    const onChecked =
        onProgress && ((checked: number) => onProgress(Math.min(checked / (counterMax + 1), MAX_UNFINISHED_PROGRESS)));

    const solution = await trackSolving(
        challenge,
        signal,
        solveInWorkers(
            {
                // Fails the type check, when the library's expectations diverge from the backend's response
                challenge,
                // Must match the backend
                counterMode: 'uint32',
                timeout: SOLVE_TIMEOUT,
            },
            signal,
            onChecked,
        ),
    );

    return {
        token: encodePayload(challenge, solution),
        expiresAt: getExpiresAt(challenge, response, receivedAt),
    };
};

export default verify;

/**
 * Splits the counter's values between the workers: each one checks every N-th value with its own offset.
 * The first found solution wins. Unlike the library's solveChallengeWorkers, it reports the progress
 */
function solveInWorkers(
    request: Omit<WorkerRequest, 'counterStart' | 'counterStep'>,
    signal: AbortSignal,
    onChecked?: (checked: number) => void,
): Promise<Solution> {
    const concurrency = Math.min(navigator.hardwareConcurrency || 1, MAX_CONCURRENCY);
    const workers = Array.from({ length: concurrency }, () => createWorker(request.challenge.parameters.algorithm));
    const checked = new Array<number>(concurrency).fill(0);
    let unfinished = concurrency;

    return new Promise<Solution>((resolve, reject) => {
        let isSettled = false;

        const settle = (callback: () => void) => {
            if (isSettled) {
                return;
            }

            isSettled = true;
            workers.forEach((worker) => worker.terminate());
            signal.removeEventListener('abort', onAbort);
            callback();
        };

        const onAbort = () => settle(() => reject(signal.reason));
        signal.addEventListener('abort', onAbort);

        workers.forEach((worker, index) => {
            worker.addEventListener('message', ({ data }: MessageEvent<WorkerResponse>) => {
                if (isSettled) {
                    return;
                }

                switch (data.type) {
                    case 'progress':
                        checked[index] = data.checked;
                        onChecked?.(checked.reduce((sum, value) => sum + value, 0));
                        break;
                    case 'solution': {
                        const { solution } = data;
                        unfinished--;

                        // The rest of the workers may still find the solution, unless the time is out for all of them
                        if (solution) {
                            settle(() => resolve(solution));
                        } else if (unfinished === 0) {
                            settle(() => reject(new Error('Failed to solve the ALTCHA challenge in time')));
                        }
                        break;
                    }
                    case 'error':
                        settle(() => reject(new Error(data.message)));
                        break;
                }
            });

            worker.addEventListener('error', (event) => {
                settle(() => reject(new Error(event.message || 'ALTCHA worker failed')));
            });

            worker.postMessage({ ...request, counterStart: index, counterStep: concurrency } satisfies WorkerRequest);
        });
    });
}

/**
 * The format, expected by the backend's AltchaOrg\Altcha\Payload::fromBase64()
 */
export function encodePayload(challenge: AltchaChallenge, solution: Solution): string {
    // The payload consists of hex strings and numbers only, so btoa() is safe here
    return btoa(
        JSON.stringify({
            challenge: {
                parameters: challenge.parameters,
                signature: challenge.signature,
            },
            solution: {
                counter: solution.counter,
                derivedKey: solution.derivedKey,
                time: solution.time,
            },
        }),
    );
}

/**
 * Converts the challenge's expiration time into the client's clock. The expiresAt is the server's timestamp,
 * while the user's clock may be off by minutes. So the remaining lifetime is calculated against the server's
 * time from the Date header and counted from the moment the challenge was received.
 */
export function getExpiresAt(challenge: AltchaChallenge, response: Response, receivedAt: number): number {
    const { expiresAt } = challenge.parameters;
    const serverDate = Date.parse(response.headers.get('Date') ?? '');
    const serverNow = Number.isNaN(serverDate) ? receivedAt : serverDate;

    return receivedAt + (expiresAt * 1000 - serverNow);
}
