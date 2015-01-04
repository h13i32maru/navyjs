/**
 * this function executes an asynchronous function as synchronous function(aka async/await).
 * an asynchronous function have to be wrapped in Generator Function.
 * and an asynchronous function must be Promise or Promise like.
 * such as Promise like is Promise[] or Object.<string, Promise>.
 * this function is implemented by referring to [tj/co](https://github.com/tj/co).
 * @param {function} generatorFunction Generator Function(function *(){}).
 * @return {Promise} if async function was successful, the promise is fulfilled.
 * @example
 * async(function *(){
 *   var result = yield request('http://example.com');
 *   return result.responseText;
 * }).then((val)=>{
 *   console.log(val);
 * });
 */
export default function async(generatorFunction) {
  var gen = generatorFunction();

  return new Promise(function(resolve, reject){
    onFulfilled();

    function onFulfilled(val) {
      try {
        var result = gen.next(val);
      } catch (e) {
        return reject(e);
      }
      return chain(result);
    }

    function onRejected(e) {
      try {
        var result = gen.throw(e);
      } catch (e) {
        return reject(e);
      }
      return chain(result);
    }

    function chain(result) {
      if (result.done) {
        return resolve(result.value);
      }

      var promise = toPromise(result.value);
      if (promise instanceof Promise) {
        return promise.then(onFulfilled).catch(onRejected);
      } else {
        reject(new Error('value can not be converted to promise. value = ' + result.value));
      }
    }
  });
}

/**
 * this function converts value to Promise.
 * @private
 * @param {Promise | Promise[] | Object.<string, Promise>} value Promise or Promise like.
 * @returns {?Promise} Promise.
 */
function toPromise(value) {
  if (value instanceof Promise) {
    return value;
  }

  if (Array.isArray(value)) {
    var result = value.every((v)=>{
      return v instanceof Promise;
    });
    if (result) {
      return Promise.all(value);
    }
  }

  if (value.constructor === Object) {
    var result = {};
    var promises = [];
    for (var key of Object.keys(value)) {
      var promise = value[key];
      if (!(promise instanceof Promise)) {
        return null;
      }

      promise = promise.then(function(key, value){
        result[key] = value;
      }.bind(this, key));

      promises.push(promise);
    }

    return Promise.all(promises).then(()=>{
      return result;
    });
  }
  return null;
}
