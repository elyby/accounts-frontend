import request, { Resp } from 'app/services/request';

export type CaptchaPublicParams = { publicKey: string } & Record<string, unknown>;

export type Options = {
    captcha: Record<string, CaptchaPublicParams>;
};

let options: Resp<Options>;

export default {
    async get(): Promise<Resp<Options>> {
        if (options) {
            return Promise.resolve(options);
        }

        const resp = await request.get<Options>('/api/options', {}, { token: null });

        options = resp;

        return resp;
    },
};
