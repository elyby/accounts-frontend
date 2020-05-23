import request, { Resp } from 'app/services/request';

export function getSecret(
    id: number,
): Promise<
    Resp<{
        qr: string;
        secret: string;
        uri: string;
    }>
> {
    return request.get(`/api/v1/accounts/${id}/two-factor-auth`);
}

export function enable(id: number, totp: string, password?: string): Promise<Resp<any>> {
    return request.post(`/api/v1/accounts/${id}/two-factor-auth`, {
        totp,
        password,
    });
}

export function disable(id: number, totp: string, password?: string): Promise<Resp<any>> {
    return request.delete(`/api/v1/accounts/${id}/two-factor-auth`, {
        totp,
        password,
    });
}
