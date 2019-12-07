const STRING_MAX_LENGTH = 128 * 1024;

/**
 * Create a copy of any object without non-serializable elements to make result safe for JSON.stringify().
 * Guaranteed to never throw.
 *
 * @param {any}    obj     Any data structure
 * @param {object} options
 * @param {Function=} options.filter - callback that is called on every object's key with (key,value) and should return
 *        value to use (may return undefined to remove unwanted keys). See nodeFilter and browserFilter.
 * @param {number=} options.depth - maximum recursion depth. Elements deeper than that are stringified with util.inspect()
 * @param {number=} options.maxSize - roughly maximum allowed size of data after JSON serialisation (but it's not guaranteed
 *        that it won't exceed the limit)
 *
 * @see https://github.com/ftlabs/js-abbreviate
 *
 * @returns {object}
 */
function abbreviate(obj, options = {}) {
  const filter =
    options.filter ||
    function(key, value) {
      return value;
    };
  const maxDepth = options.depth || 10;
  const maxSize = options.maxSize || 1 * 1024 * 1024;

  return abbreviateRecursive(
    undefined,
    obj,
    filter,
    { sizeLeft: maxSize },
    maxDepth,
  );
}

function limitStringLength(str) {
  if (str.length > STRING_MAX_LENGTH) {
    return `${str.substring(0, STRING_MAX_LENGTH / 2)} … ${str.substring(
      str.length - STRING_MAX_LENGTH / 2,
    )}`;
  }

  return str;
}

function abbreviateRecursive(key, obj, filter, state, maxDepth) {
  if (state.sizeLeft < 0) {
    return '**skipped**';
  }

  state.sizeLeft -= 5; // rough approximation of JSON overhead

  obj = filter(key, obj);

  try {
    switch (typeof obj) {
      case 'object': {
        if (obj === null) {
          return null;
        }

        if (maxDepth < 0) {
          break; // fall back to stringification
        }

        const newobj = Array.isArray(obj) ? [] : {};

        for (const i in obj) {
          if (!obj.hasOwnProperty(i)) {
            continue;
          }

          newobj[i] = abbreviateRecursive(
            i,
            obj[i],
            filter,
            state,
            maxDepth - 1,
          );

          if (state.sizeLeft < 0) {
            break;
          }
        }

        return newobj;
      }

      case 'string':
        obj = limitStringLength(obj);
        state.sizeLeft -= obj.length;

        return obj;

      case 'number':
      case 'boolean':
      case 'undefined':
      default:
        return obj;
    }
  } catch (err) {
    /* fall back to inspect*/
  }

  try {
    obj = limitStringLength(`${obj}`);
    state.sizeLeft -= obj.length;

    return obj;
  } catch (err) {
    return '**non-serializable**';
  }
}

function commonFilter(key, val) {
  if (typeof val === 'function') {
    return undefined;
  }

  if (val instanceof Date) {
    return `**Date** ${val}`;
  }

  if (val instanceof Error) {
    const err = {
      // These properties are implemented as magical getters and don't show up in for in
      stack: val.stack,
      message: val.message,
      name: val.name,
    };

    for (const i in val) {
      if (!val.hasOwnProperty(i)) {
        continue;
      }

      err[i] = val[i];
    }

    return err;
  }

  return val;
}

function nodeFilter(key, val) {
  // domain objects are huge and have circular references
  if (key === 'domain' && typeof val === 'object' && val._events) {
    return '**domain ignored**';
  }

  if (key === 'domainEmitter') {
    return '**domainEmitter ignored**';
  }

  if (val === global) {
    return '**global**';
  }

  return commonFilter(key, val);
}

function browserFilter(key, val) {
  if (val === window) {
    return '**window**';
  }

  if (val === document) {
    return '**document**';
  }

  if (val instanceof HTMLElement) {
    const { outerHTML } = val;

    if (typeof outerHTML !== 'undefined') {
      return `**HTMLElement** ${outerHTML}`;
    }
  }

  return commonFilter(key, val);
}

export { abbreviate, nodeFilter, browserFilter };

export default function(obj) {
  return abbreviate(obj, {
    filter: browserFilter,
  });
}
