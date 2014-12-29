module.exports = function(config) {
  config.set({
    basePath: '../',
    frameworks: ['mocha'],
    files: [
      'node_modules/traceur/bin/traceur-runtime.js',
      'bower_components/power-assert/build/power-assert.js',
      'build/navy.js',
      'build/test/espowered_all_test.js'
    ],
    reporters: ['progress', 'coverage'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    browsers: ['Chrome'],
    singleRun: true,
    preprocessors: {
      'build/navy.js': ['coverage']
    },

    customLaunchers: {
      ChromeTravis: {
        base: 'Chrome',
        flags: ['--no-sandbox']
      }
    }
  });
};
