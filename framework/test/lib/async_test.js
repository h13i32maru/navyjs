let async = System.get('../src/lib/async').default;

describe('async: ', ()=>{
  var VALUE = 123;

  function delayValue(value, msec) {
    return new Promise((resolve, reject)=>{
      if (msec < 0) {
        return reject(new Error('msec must be greater than 0'));
      }

      setTimeout(()=>{
        resolve(value);
      }, msec);
    });
  }

  function failTest() {
    assert(false, 'force fail test');
  }

  it('executes an async function as sync function.', (done)=>{
    async(function*(){
      var x = yield delayValue(VALUE, 100);
      assert.equal(x, VALUE);

      var y = yield delayValue(VALUE * 2, 200);
      assert.equal(y, VALUE * 2);

      return x;
    }).then((value)=>{
      assert.equal(value, VALUE);
      done();
    });
  });

  it('throws exception if an async function throws exception.', (done)=>{
    async(function*(){
      try {
        var x = yield delayValue(VALUE, -1);
        assert(false);
      } catch (e) {
        assert(e instanceof Error);
      }

      var y = yield delayValue(VALUE * 2, 100);
      assert.equal(y, VALUE * 2);
      done();
    });
  });

  it('is rejected if exception is thrown.', (done)=>{
    async(function*(){
      throw new Error();
    }).catch((e)=>{
      assert(e instanceof Error);
      done();
    });
  });

  it('is rejected if an async function throws unhandled exception.', (done)=>{
    async(function*(){
      var x = yield delayValue(VALUE, -1);
    }).catch((e)=>{
      assert(e instanceof Error);
      done();
    });
  });

  it('executes multiple(array) async functions.', ()=>{
    return async(function*(){
      var result = yield [delayValue(1, 100), delayValue(2, 200), delayValue(3, 300)];
      assert.deepEqual(result, [1, 2, 3]);
    });
  });

  it('executes multiple(hash) async functions.', ()=>{
    return async(function*(){
      var result = yield {a: delayValue(1, 100), b: delayValue(2, 200), c: delayValue(3, 300)};
      assert.deepEqual(result, {a: 1, b: 2, c: 3});
    });
  });

  it('is rejected if an async function returns non promise.', ()=>{
    return async(function*(){
      yield setTimeout(()=>{}, 100);
    }).then(failTest, (e)=>{
      assert(e instanceof Error);
    });
  });

  it ('is rejected multiple(array) async functions if that includes non promise.', ()=>{
    return async(function*(){
      yield [delayValue(1, 100), 123];
    }).then(failTest, (e)=>{
      assert(e instanceof Error);
    });
  });

  it ('is rejected multiple(hash) async functions if that includes non promise.', ()=>{
    return async(function*(){
      yield {a: delayValue(1, 100), b: 123};
    }).then(failTest, (e)=>{
      assert(e instanceof Error);
    });
  });
});
