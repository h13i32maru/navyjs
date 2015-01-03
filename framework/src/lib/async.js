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

      var promise = result.value;
      if (promise instanceof Promise) {
        return promise.then(onFulfilled).catch(onRejected);
      } else {
        reject(new Error('should be promise'));
      }
    }
  });
}
