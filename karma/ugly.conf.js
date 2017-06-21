let sharedConfig = require('./shared.conf.js');

module.exports = function(config) {
  let conf = {
    files: [
      'node_modules/angular/angular.min.js',
      'node_modules/angular-route/angular-route.min.js',
      'node_modules/angular-cookies/angular-cookies.min.js',
      'node_modules/angular-sanitize/angular-sanitize.min.js',
      'node_modules/highlightjs/highlight.pack.min.js',
      'node_modules/showdown/dist/showdown.min.js',
      'node_modules/ng-showdown/dist/ng-showdown.min.js',
      'node_modules/angular-mocks/angular-mocks.js',
      'app/client/home.min.js',
      'app/test/client/*.spec.js'
    ],
    reporters: ['progress'],
    autoWatch: false,
    singleRun: true,
    browsers: ['ChromeHeadless']
  }

  config.set(Object.assign(conf, sharedConfig))
}