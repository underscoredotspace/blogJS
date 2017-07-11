describe('Client main', () => {
  require('angular')
  require('angular-cookies')
  require('angular-route')
  require('angular-sanitize')
  window.showdown = require('showdown')
  require('ng-showdown')
  require('highlightjs')
  require('angular-mocks')

  require('../../client/src/00-main.js')

  let $rootScope, $controller, $location, $filter

  const authService = {
    loggedin: false,
    isLoggedIn: jest.fn().mockImplementation(() => authService.loggedin),
    logout: jest.fn().mockImplementation(fakePromise),
    login: jest.fn().mockImplementation(fakePromise)
  }

  let promiseOk = true
  function fakePromise() {
    if (promiseOk) {
      return new Promise((resolve, reject) => resolve('ok'))
    } else {
      return new Promise((resolve, reject) => reject('error'))
    }
  }

  beforeEach(() => {
    authService.loggedin = false
    authService.ok = false
    jest.clearAllMocks()

    angular.mock.module('colonApp')

    inject(function($injector) {
      $rootScope = $injector.get('$rootScope')
      $controller = $injector.get('$controller')
      $location = $injector.get('$location')
      $filter = $injector.get('$filter')
    })
  })

  describe('blogController', () => {
    it('Reflects us being logged in', () => {
      authService.loggedin = true
      var controller = $controller('blogController', {authService:authService})
      $rootScope.$broadcast('auth-status')
      expect(authService.isLoggedIn).toHaveBeenCalled()
      expect(controller.loggedin).toEqual(true);
    })

    it('Reflects us being not logged in', () => {
      authService.loggedin = false
      var controller = $controller('blogController', {authService:authService})
      $rootScope.$broadcast('auth-status')
      expect(authService.isLoggedIn).toHaveBeenCalled()
      expect(controller.loggedin).toEqual(false);
    })
  })

  describe('logoutController', () => {
    it('Should log us out', () => {
      authService.loggedin = true
      var controller = $controller('logout', {authService:authService})
      expect(authService.logout).toHaveBeenCalled()    
      expect($location.path()).toBe('/home')  
    })

    it('Should just go home cos we\'re not logged in', () => {
      authService.loggedin = false
      var controller = $controller('logout', {authService:authService})
      expect(authService.logout).not.toHaveBeenCalled()  
      expect($location.path()).toBe('/home')
    })
  })

  describe('loginController', () => {
    it('Should log us in', () => {
      authService.loggedin = false
      var controller = $controller('login', {authService:authService})
      expect(controller.login).toBeInstanceOf(Function)
      controller.login()
      $rootScope.$digest()
      expect($location.path()).toBe('/home')  
    })

    it('Should just go home cos we\'re already logged in', () => {
      authService.loggedin = true
      var controller = $controller('login', {authService:authService})
      expect(controller.login).toBeUndefined()
      expect($location.path()).toBe('/home')
    })
  })
})