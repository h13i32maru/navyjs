describe('FileStorage: ', ()=>{
  function sort(files) {
    files.sort((a, b)=>{
      return a.path <= b.path ? -1 : 1;
    });
  }

  it('writes and reads one file.', ()=>{
    return async(function*(){
      var storage = new FileStorage('org.navyjs');
      yield storage.open();

      var file = {path: '/sample/hoge.js', content: 'this is hoge.js', hash: '00000000000'};
      yield storage.write(file);

      var result = yield storage.read('/sample/hoge.js');
      assert.deepEqual(result, file);
    });
  });

  it('writes and reads multi files.', ()=>{
    return async(function*(){
      var storage = new FileStorage('org.navyjs');
      yield storage.open();

      var files = [
        {path: '/sample/hoge.js', content: 'this is hoge.js', hash: '00000000000'},
        {path: '/sample/foo.js', content: 'this is foo.js', hash: '11111111'}
      ];
      yield storage.write(files);

      var result = yield storage.read(['/sample/hoge.js', '/sample/foo.js']);

      sort(files);
      sort(result);
      assert.deepEqual(result, files);
    });
  });

  it('reads all files.', ()=>{
    return async(function*(){
      var storage = new FileStorage('org.navyjs');
      yield storage.open();

      var files = [
        {path: '/sample/hoge.js', content: 'this is hoge.js', hash: '00000000000'},
        {path: '/sample/foo.js', content: 'this is foo.js', hash: '11111111'}
      ];
      yield storage.write(files);

      var result = yield storage.readAll();

      sort(files);
      sort(result);
      assert.deepEqual(result, files);
    });
  });

  it('removes a file.', ()=>{
    return async(function*(){
      var storage = new FileStorage('org.navyjs');
      yield storage.open();

      var files = [
        {path: '/sample/hoge.js', content: 'this is hoge.js', hash: '00000000000'},
        {path: '/sample/foo.js', content: 'this is foo.js', hash: '11111111'}
      ];
      yield storage.write(files);

      yield storage.remove('/sample/hoge.js');

      var result = yield storage.read('/sample/hoge.js');

      assert.equal(result, null);
    });
  });

  it('removes multi files.', ()=>{
    return async(function*(){
      var storage = new FileStorage('org.navyjs');
      yield storage.open();

      var files = [
        {path: '/sample/hoge.js', content: 'this is hoge.js', hash: '00000000000'},
        {path: '/sample/foo.js', content: 'this is foo.js', hash: '11111111'}
      ];
      yield storage.write(files);

      yield storage.remove(['/sample/hoge.js', '/sample/foo.js']);

      var result = yield storage.read(['/sample/hoge.js', '/sample/foo.js']);

      assert.deepEqual(result, []);
    });
  });

  it('removes all files.', ()=>{
    return async(function*(){
      var storage = new FileStorage('org.navyjs');
      yield storage.open();

      var files = [
        {path: '/sample/hoge.js', content: 'this is hoge.js', hash: '00000000000'},
        {path: '/sample/foo.js', content: 'this is foo.js', hash: '11111111'}
      ];
      yield storage.write(files);

      yield storage.removeAll();

      var result = yield storage.readAll();

      assert.deepEqual(result, []);
    });
  });


  it('throws error when file is invalid.', ()=> {
    return async(function*(){
      var storage = new FileStorage('org.navyjs');
      yield storage.open();

      var file = {path: null, content: 'this is hoge.js', hash: '00000000000'};
      try {
        yield storage.write(file);
      } catch(e) {
        assert(e instanceof Error);
        return;
      }

      throw new Error('unreachable');
    });
  });

  it('deletes storage.', ()=>{
    return async(function*(){
      var storage = new FileStorage('org.navyjs');
      yield storage.open();
      storage.deleteStorage();

      try {
        yield storage.readAll();
      } catch(e) {
        assert(e instanceof Error);
        return;
      }

      throw new Error('unreachable');
    });
  });
});

