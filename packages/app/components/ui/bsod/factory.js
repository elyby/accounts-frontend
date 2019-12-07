import request from 'app/services/request';
import logger from 'app/services/logger';

import dispatchBsod, { inject } from './dispatchBsod';
import BsodMiddleware from './BsodMiddleware';

export default function factory(store, stopLoading) {
  inject(store, stopLoading);

  // do bsod for 500/404 errors
  request.addMiddleware(new BsodMiddleware(dispatchBsod, logger));
}
