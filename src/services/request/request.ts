import PromiseMiddlewareLayer, { Middleware } from './PromiseMiddlewareLayer';
import InternalServerError from './InternalServerError';
import RequestAbortedError from './RequestAbortedError';

const middlewareLayer = new PromiseMiddlewareLayer();

export type Resp<T> = T & {
  originalResponse: Response;
};

export interface Options extends RequestInit {
  token?: string | null;
  headers: { [key: string]: any };
}

const buildOptions = (
  method: string,
  data: { [key: string]: any } | undefined,
  options: Partial<Options> = {},
): Options => ({
  method,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    ...options.headers,
  },
  body: buildQuery(data),
  ...options,
});

export default {
  /**
   * @param {string} url
   * @param {object} [data] - request data
   * @param {object} [options] - additional options for fetch or middlewares
   *
   * @returns {Promise}
   */
  post<T>(
    url: string,
    data?: { [key: string]: any },
    options?: Partial<Options>,
  ): Promise<Resp<T>> {
    return doFetch(url, buildOptions('POST', data, options));
  },

  /**
   * @param {string} url
   * @param {object} [data] - request data
   * @param {object} [options] - additional options for fetch or middlewares
   *
   * @returns {Promise}
   */
  get<T>(
    url: string,
    data?: { [key: string]: any },
    options?: Partial<Options>,
  ): Promise<Resp<T>> {
    url = buildUrl(url, data);

    return doFetch(url, { ...options, method: 'GET', headers: {} });
  },

  /**
   * @param {string} url
   * @param {object} [data] - request data
   * @param {object} [options] - additional options for fetch or middlewares
   *
   * @returns {Promise}
   */
  delete<T>(
    url: string,
    data?: { [key: string]: any },
    options?: Partial<Options>,
  ): Promise<Resp<T>> {
    return doFetch(url, buildOptions('DELETE', data, options));
  },

  /**
   * @param {string} url
   * @param {object} [data] - request data
   * @param {object} [options] - additional options for fetch or middlewares
   *
   * @returns {Promise}
   */
  put<T>(
    url: string,
    data?: { [key: string]: any },
    options?: Partial<Options>,
  ): Promise<Resp<T>> {
    return doFetch(url, buildOptions('PUT', data, options));
  },

  /**
   * Serializes object into encoded key=value presentation
   *
   * @param {object} data
   *
   * @returns {string}
   */
  buildQuery,

  /**
   * @param {object} middleware
   * @param {Function} [middleware.before] - a function({url, options}), that will be called before executing request.
   *                                         It will get data object {url, options} as an argument and should return
   *                                         Promise, that will resolve into new data object
   * @param {Function} [middleware.then] - a function(resp), that will be called on successful request result. It will
   *                                       get response as an argument and should return a Promise that resolves to
   *                                       the new response
   * @param {Function} [middleware.catch] - a function(resp, restart), that will be called on request fail. It will
   *                                        get response and callback to restart request as an arguments and should
   *                                        return a Promise that resolves to the new response.
   */
  addMiddleware(middleware: Middleware) {
    middlewareLayer.add(middleware);
  },
};

const checkStatus = (resp: Response) =>
  resp.status >= 200 && resp.status < 300
    ? Promise.resolve(resp)
    : Promise.reject(resp);
const toJSON = (resp: Response) => {
  if (!resp.json || resp.status === 0) {
    // e.g. 'TypeError: Failed to fetch' due to CORS or request was aborted
    throw new RequestAbortedError(resp);
  }

  return resp.json().then(
    json => {
      json.originalResponse = resp;

      return json;
    },
    error => Promise.reject(new InternalServerError(error, resp)),
  );
};
const rejectWithJSON = (resp: Response) =>
  toJSON(resp).then(resp => {
    if (resp.originalResponse.status >= 500) {
      throw new InternalServerError(resp, resp.originalResponse);
    }

    throw resp;
  });
const handleResponseSuccess = resp =>
  resp.success || typeof resp.success === 'undefined'
    ? Promise.resolve(resp)
    : Promise.reject(resp);

async function doFetch(url: string, options: Options) {
  // NOTE: we are wrapping fetch, because it is returning
  // Promise instance that can not be polyfilled with Promise.prototype.finally

  const headers: { [key: string]: string } = { ...options.headers } as any;
  headers.Accept = 'application/json';

  options.headers = headers;

  return middlewareLayer
    .run('before', { url, options })
    .then(({ url: nextUrl, options: nextOptions }) =>
      fetch(nextUrl, nextOptions)
        .then(checkStatus)
        .then(toJSON, rejectWithJSON)
        .then(handleResponseSuccess)
        .then(resp =>
          middlewareLayer.run('then', resp, {
            url: nextUrl,
            options: nextOptions,
          }),
        )
        .catch(resp =>
          middlewareLayer.run(
            'catch',
            resp,
            { url: nextUrl, options: nextOptions },
            () => doFetch(nextUrl, nextOptions),
          ),
        ),
    );
}

/**
 * Converts specific js values to query friendly values
 *
 * @param {any} value
 *
 * @returns {string}
 */
function convertQueryValue(value: any): string {
  if (typeof value === 'undefined' || value === null) {
    return '';
  }

  if (value === true) {
    return '1';
  }

  if (value === false) {
    return '0';
  }

  return String(value);
}

/**
 * Serializes object into encoded key=value presentation
 *
 * @param {object} data
 *
 * @returns {string}
 */
function buildQuery(data: { [key: string]: any } = {}): string {
  return Object.keys(data)
    .map(keyName =>
      [keyName, convertQueryValue(data[keyName])]
        .map(encodeURIComponent)
        .join('='),
    )
    .join('&');
}

function buildUrl(url: string, data?: { [key: string]: any }): string {
  if (typeof data === 'object' && Object.keys(data).length) {
    const separator = url.indexOf('?') === -1 ? '?' : '&';
    url += separator + buildQuery(data);
  }

  return url;
}
