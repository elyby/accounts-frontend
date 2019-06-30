import unexpected from 'unexpected';

const expect = unexpected.clone();

expect.use(require('unexpected-sinon'));

export default expect;
