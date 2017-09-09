// @flow
import request from 'services/request';
import type { Resp } from 'services/request';

export default {
    getSecret(): Promise<Resp<{qr: string, secret: string, uri: string}>> {
        return request.get('/api/two-factor-auth');
    },

    enable(data: {totp: string, password?: string}): Promise<Resp<*>> {
        return request.post('/api/two-factor-auth', {
            totp: data.totp,
            password: data.password || ''
        });
    },

    disable(data: {totp: string, password?: string}): Promise<Resp<*>> {
        return request.delete('/api/two-factor-auth', {
            totp: data.totp,
            password: data.password || ''
        });
    }
};
