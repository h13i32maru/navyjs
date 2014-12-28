// require
var path = require('path');
var fs = require('fs');
var exec = require('child_process').exec;

// path setting
var selfPath = process.argv[1];
var projectRootPath = path.normalize(path.dirname(selfPath) + '/../');
var traceur = path.normalize(projectRootPath + '/node_modules/.bin/traceur');
var srcPath = path.normalize(projectRootPath + '/src/navy.js');
var outPath = path.normalize(projectRootPath + '/build/navy.js');

// compile
exec(traceur + ' --out ' + outPath + ' --module ' + srcPath, function(error, stdout, stderr){
  if (error) {
    console.log(stderr);
    process.exit(1);
  } else {
    console.log(outPath);
    console.log('build success.');
  }
});
