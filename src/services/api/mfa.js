// @flow
import request from 'services/request';
import type { Resp } from 'services/request';

export default {
    getSecret(): Promise<Resp<{qr: string, secret: string, uri: string}>> {
        return request.get('/api/two-factor-auth');
    },

    enable(data: {totp: string, password?: string}): Promise<Resp<*>> {
        return request.post('/api/two-factor-auth', {
            token: data.totp,
            password: data.password || ''
        }).catch((resp) => {
            if (resp.errors) {
                if (resp.errors.token) {
                    resp.errors.totp = resp.errors.token.replace('token', 'totp');
                    delete resp.errors.token;
                }
            }

            return Promise.reject(resp);
        });
    }
};
