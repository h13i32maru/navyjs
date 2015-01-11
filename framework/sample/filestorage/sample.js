async(function*(){
  var storage = new FileStorage('org.navyjs');
  yield storage.open();

  var files = [
    {path: '/sample/hoge.js', content: 'this is hoge.js', hash: '00000000000'},
    {path: '/sample/foo.js', content: 'this is foo.js', hash: '11111111'}
  ];
  yield storage.write(files);

  var file = yield storage.read('/sample/hoge.js');
  console.log(file);
});

