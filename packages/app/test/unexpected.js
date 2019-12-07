/* eslint-disable @typescript-eslint/no-var-requires */
import unexpected from 'unexpected';

const expect = unexpected.clone();

expect.use(require('unexpected-sinon'));

export default expect;
