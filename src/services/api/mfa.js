// @flow
import request from 'services/request';
import type { Resp } from 'services/request';

export default {
    getSecret(): Promise<Resp<{qr: string, secret: string, uri: string}>> {
        return request.get('/api/two-factor-auth');
    }
};
