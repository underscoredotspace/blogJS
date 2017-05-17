// Karma configuration
// Generated on Mon May 15 2017 22:16:07 GMT+0100 (BST)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
      'https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.6.4/angular.min.js',
      'https://ajax.googleapis.com/ajax/libs/angularjs/1.6.4/angular-cookies.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.6.4/angular-route.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.6.4/angular-sanitize.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/showdown/1.6.4/showdown.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.10.0/highlight.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/ng-showdown/1.1.0/ng-showdown.min.js',
      'https://code.angularjs.org/1.6.4/angular-mocks.js',
      'client/home.js',
      'spec/**/*.spec.js'
    ],


    // list of files to exclude
    exclude: [
      '*.min.js'
    ],

    // coverage reporter generates the coverage
    reporters: ['progress', 'coverage', 'coveralls'],

    preprocessors: {
      // source files, that you wanna generate coverage for
      // do not include tests or libraries
      // (these files will be instrumented by Istanbul)
      'client/*.js': ['coverage']
    },
    coverageReporter: {
      type : 'lcov',
      dir : 'coverage/'
    },

    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['PhantomJS'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  })
}
