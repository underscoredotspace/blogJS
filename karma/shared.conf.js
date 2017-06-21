module.exports = {
  basePath: '../',
  frameworks: ['jasmine'],
  colors: true,
  concurrency: Infinity,
  
  coverageReporter: {
    type : 'lcov',
    dir : 'coverage/'
  }
}