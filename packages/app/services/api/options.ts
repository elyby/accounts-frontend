import { type Resp, get } from 'app/services/request';

export type CaptchaPublicParams = Readonly<Record<string, unknown>>;

export type Options = {
    captcha: Record<string, CaptchaPublicParams>;
};

let options: Resp<Options>;

export async function fetch(): Promise<Resp<Options>> {
    if (options) {
        return Promise.resolve(options);
    }

    const resp = await get<Options>('/api/options', {}, { token: null });

    options = resp;

    return resp;
}
