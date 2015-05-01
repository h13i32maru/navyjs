async(function*(){
  var webInstaller = new WebInstaller('./manifest.json');
  yield webInstaller.exec();
  console.log('done');
});
