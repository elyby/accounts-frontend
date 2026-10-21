import expect from 'app/test/unexpected';

import { getHashRateBucket } from './metrics';

describe('services/captcha/providers/altcha/metrics', () => {
    describe('#getHashRateBucket', () => {
        it('should return the lower bound of the power of 2 bucket', () => {
            expect(getHashRateBucket(0.5), 'to equal', 0);
            expect(getHashRateBucket(1), 'to equal', 1);
            expect(getHashRateBucket(1000), 'to equal', 512);
            expect(getHashRateBucket(1024), 'to equal', 1024);
            expect(getHashRateBucket(2047.9), 'to equal', 1024);
        });
    });
});
