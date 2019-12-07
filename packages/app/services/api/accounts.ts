import request from 'app/services/request';

export interface UserResponse {
  elyProfileLink: string;
  email: string;
  hasMojangUsernameCollision: boolean;
  id: number;
  isActive: boolean;
  isOtpEnabled: boolean;
  lang: string;
  passwordChangedAt: number; // timestamp
  registeredAt: number; // timestamp
  shouldAcceptRules: boolean;
  username: string;
  uuid: string;
}

export function getInfo(id: number, token?: string): Promise<UserResponse> {
  return request.get(
    `/api/v1/accounts/${id}`,
    {},
    {
      token,
    },
  );
}

export function changePassword(
  id: number,
  {
    password = '',
    newPassword = '',
    newRePassword = '',
    logoutAll = true,
  }: {
    password?: string;
    newPassword?: string;
    newRePassword?: string;
    logoutAll?: boolean;
  },
): Promise<{ success: boolean }> {
  return request.post(`/api/v1/accounts/${id}/password`, {
    password,
    newPassword,
    newRePassword,
    logoutAll,
  });
}

export function acceptRules(id: number): Promise<{ success: boolean }> {
  return request.post(`/api/v1/accounts/${id}/rules`);
}

export function changeUsername(
  id: number,
  username: string | void,
  password: string | void,
): Promise<{ success: boolean }> {
  return request.post(`/api/v1/accounts/${id}/username`, {
    username,
    password,
  });
}

export function changeLang(
  id: number,
  lang: string,
): Promise<{ success: boolean }> {
  return request.post(`/api/v1/accounts/${id}/language`, {
    lang,
  });
}

export function requestEmailChange(
  id: number,
  password: string,
): Promise<{ success: boolean }> {
  return request.post(`/api/v1/accounts/${id}/email-verification`, {
    password,
  });
}

export function setNewEmail(
  id: number,
  email: string,
  key: string,
): Promise<{ success: boolean }> {
  return request.post(`/api/v1/accounts/${id}/new-email-verification`, {
    email,
    key,
  });
}

export function confirmNewEmail(
  id: number,
  key: string,
): Promise<{ success: boolean }> {
  return request.post(`/api/v1/accounts/${id}/email`, {
    key,
  });
}
