import { type Resp, get } from 'app/services/request';

export interface AltchaChallenge {
    parameters: {
        algorithm: string;
        cost: number;
        keyLength: number;
        keyPrefix: string;
        keySignature: string;
        nonce: string;
        salt: string;
        expiresAt: number; // The server's timestamp in seconds
        data: {
            counterMax: number;
        };
    };
    signature: string;
}

/**
 * @param url - the challengeUrl from the ALTCHA's captcha params
 */
export function getAltchaChallenge(url: string = '/api/captcha/altcha/challenge'): Promise<Resp<AltchaChallenge>> {
    return get(url, {}, { token: null });
}
