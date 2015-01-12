describe('FileStorage: ', ()=>{
  function sort(files) {
    files.sort((a, b)=>{
      return a.path <= b.path ? -1 : 1;
    });
  }

  const DB_NAME = 'org.navyjs';
  const files = [
    {path: '/sample/hoge.js', content: 'this is hoge.js', hash: '00000000000'},
    {path: '/sample/foo.js', content: 'this is foo.js', hash: '11111111'}
  ];
  const file = files[0];

  after(()=>{
    var storage = new FileStorage(DB_NAME);
    storage.deleteStorage();
  });

  it('writes and reads one file.', ()=>{
    return async(function*(){
      var storage = new FileStorage(DB_NAME);
      yield storage.open();

      yield storage.write(file);

      var result = yield storage.read(file.path);
      assert.deepEqual(result, file);
    });
  });

  it('writes and reads multi files.', ()=>{
    return async(function*(){
      var storage = new FileStorage(DB_NAME);
      yield storage.open();

      yield storage.write(files);

      var result = yield storage.read([files[0].path, files[1].path]);
      sort(files);
      sort(result);
      assert.deepEqual(result, files);
    });
  });

  it('reads all files.', ()=>{
    return async(function*(){
      var storage = new FileStorage(DB_NAME);
      yield storage.open();

      yield storage.write(files);

      var result = yield storage.readAll();
      sort(files);
      sort(result);
      assert.deepEqual(result, files);
    });
  });

  it('removes a file.', ()=>{
    return async(function*(){
      var storage = new FileStorage(DB_NAME);
      yield storage.open();

      yield storage.write(files);

      yield storage.remove(files[0].path);

      var result = yield storage.read(files[0].path);
      assert.equal(result, null);
    });
  });

  it('removes multi files.', ()=>{
    return async(function*(){
      var storage = new FileStorage(DB_NAME);
      yield storage.open();

      yield storage.write(files);

      yield storage.remove([files[0].path, files[1].path]);

      var result = yield storage.read([files[0].path, files[1].path]);
      assert.deepEqual(result, []);
    });
  });

  it('removes all files.', ()=>{
    return async(function*(){
      var storage = new FileStorage(DB_NAME);
      yield storage.open();

      yield storage.write(files);

      yield storage.removeAll();

      var result = yield storage.readAll();

      assert.deepEqual(result, []);
    });
  });


  it('throws error when file is invalid.', ()=> {
    return async(function*(){
      var storage = new FileStorage(DB_NAME);
      yield storage.open();

      try {
        var file = {path: null, content: 'invalid', hash: 12345};
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
      var storage = new FileStorage(DB_NAME);
      yield storage.open();

      yield storage.write(file);

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

