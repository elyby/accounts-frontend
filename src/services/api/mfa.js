// @flow
import type { Resp } from 'services/request';
import request from 'services/request';

export function getSecret(
  id: number,
): Promise<
  Resp<{
    qr: string,
    secret: string,
    uri: string,
  }>,
> {
  return request.get(`/api/v1/accounts/${id}/two-factor-auth`);
}

export function enable(
  id: number,
  totp: string,
  password?: string,
): Promise<Resp<*>> {
  return request.post(`/api/v1/accounts/${id}/two-factor-auth`, {
    totp,
    password,
  });
}

export function disable(
  id: number,
  totp: string,
  password?: string,
): Promise<Resp<*>> {
  return request.delete(`/api/v1/accounts/${id}/two-factor-auth`, {
    totp,
    password,
  });
}
