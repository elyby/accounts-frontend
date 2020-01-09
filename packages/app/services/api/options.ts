import request, { Resp } from 'app/services/request';

type Options = { reCaptchaPublicKey: string };

let options: Resp<Options>;

export default {
  async get(): Promise<Resp<Options>> {
    if (options) {
      return Promise.resolve(options);
    }

    const resp = await request.get<Options>(
      '/api/options',
      {},
      { token: null },
    );

    options = resp;

    return resp;
  },
};
