require('angular')
require('angular-cookies')
require('angular-route')
require('angular-sanitize')
window.showdown = require('showdown')
require('ng-showdown')
window.hljs = ('highlightjs')
require('angular-mocks')

require('../../client/src/00-config.js')
require('../../client/src/01-main.js')
require('../../client/src/04-auth-service.js')

describe('authService: Controls authentication', () => {
  let authService, $httpBackend, $cookies, $controller

  beforeEach(() => {
    angular.mock.module('colonApp')

    inject(function($injector) {
      authService = $injector.get('authService')
      $httpBackend = $injector.get('$httpBackend')
      $cookies = $injector.get('$cookies')
      $controller = $injector.get('$controller')
    })
  })
  
  afterEach(() => {
    $cookies.remove('qqBlog')
    $httpBackend.verifyNoOutstandingExpectation()
    $httpBackend.verifyNoOutstandingRequest()
  })

  it('should contain a functions login, logout and isLoggedIn', () => {
    expect.assertions(3)
    expect(authService.login).toBeInstanceOf(Function)
    expect(authService.logout).toBeInstanceOf(Function)
    expect(authService.isLoggedIn).toBeInstanceOf(Function)
  })

  it('should return logged in status as false', () => {
    expect.assertions(1)
    $cookies.remove('qqBlog')
    expect(authService.isLoggedIn()).toBeFalsy()
  })

  it('should return logged in status as true', () => {
    expect.assertions(1)
    $cookies.put('qqBlog', true)
    expect(authService.isLoggedIn()).toBeTruthy()
  })

  it('should log user in', () => {
    expect.assertions(1)
    const login = $httpBackend.expectPOST('/api/user/login').respond('OK')
    authService.login(123456)
    .then(res => {
      expect(res.status).toBe(200)
    })
    $httpBackend.flush()
  })

  it('should fail to log user in', () => {
    expect.assertions(1)
    const login = $httpBackend.expectPOST('/api/user/login').respond(()=> [403,'Incorrect code'])
    authService.login(123456)
    .catch(() => {
      const loggedin = authService.isLoggedIn()
      expect(loggedin).toBe(false)
    })

    $httpBackend.flush()
  })

  it('should log the user out', () => {
    expect.assertions(1)
    const logout = $httpBackend.expectGET('/api/user/logout').respond([])
    authService.logout()
    .then(() => {
      const loggedin = authService.isLoggedIn()
      expect(loggedin).toBe(false)
    })

    $httpBackend.flush()
  })
})