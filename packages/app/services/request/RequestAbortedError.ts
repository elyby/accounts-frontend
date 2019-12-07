function RequestAbortedError(error: Error | Response) {
  this.name = 'RequestAbortedError';
  this.message = 'RequestAbortedError';
  this.error = error;
  this.stack = new Error().stack;

  if (typeof error === 'string') {
    this.message = error;
  } else {
    if ('message' in error) {
      this.message = error.message;
    }

    this.error = error;
    Object.assign(this, error);
  }
}

RequestAbortedError.prototype = Object.create(Error.prototype);
RequestAbortedError.prototype.constructor = RequestAbortedError;

export default RequestAbortedError;
