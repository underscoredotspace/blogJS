describe('showdownConfig', () => {
  require('angular')
  require('angular-cookies')
  require('angular-route')
  require('angular-sanitize')
  require('angular-mocks')
  require('../../client/src/ngApp/00-config.js')

  beforeEach(() => {
    angular.mock.module('colonApp')
  })

  test('Test Config', () => {
    expect.assertions(0)
  })
})