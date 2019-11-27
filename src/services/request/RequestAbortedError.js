// @flow
function RequestAbortedError(error: Error | Response) {
  this.name = 'RequestAbortedError';
  this.message = 'RequestAbortedError';
  this.error = error;
  this.stack = new Error().stack;

  if (error.message) {
    this.message = error.message;
  }

  if (typeof error === 'string') {
    this.message = error;
  } else {
    this.error = error;
    Object.assign(this, error);
  }
}

RequestAbortedError.prototype = Object.create(Error.prototype);
RequestAbortedError.prototype.constructor = RequestAbortedError;

export default RequestAbortedError;
