let async = System.get('../src/lib/async').default;

describe('async: ', ()=>{
  it('is function', ()=>{
    assert.equal(typeof async, 'function');
  });
});
