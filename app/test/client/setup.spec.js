require('angular')
require('angular-cookies')
require('angular-route')
require('angular-sanitize')
window.showdown = require('showdown')
require('ng-showdown')
require('highlightjs')
require('angular-mocks')
require('../../client/src/00-config.js')
require('../../client/src/01-main.js')
require('../../client/src/05-setup.js')

describe('Setup', () => {
  beforeEach(() => {
    angular.mock.module('colonApp')
  })

  describe('Service', () => {
    let $httpBackend, setupService

    afterEach(() => {
      $httpBackend.verifyNoOutstandingExpectation()
      $httpBackend.verifyNoOutstandingRequest()
    });

    beforeEach(() => { 
      inject(function($injector) {
        $httpBackend = $injector.get('$httpBackend')
        setupService = $injector.get('setupService')
      })
    })

    test('Print setup code', () => {
      expect.assertions(1)
      const getQR = $httpBackend.expectGET('/api/setup/code').respond([])
      setupService.printSetupCode()
        .then(res => {
          expect(res.status).toBe(200)
        })

      $httpBackend.flush()
    })
    
    test('Get QR', () => {
      expect.assertions(1)
      const getQR = $httpBackend.expectPOST('/api/setup/qr').respond({qr:'qrcode'})
      setupService.getQR('123456')
        .then(qr => {
          expect(qr).toBe('qrcode')
        })

      $httpBackend.flush()
    })

    test('Fail to get QR because invalid code', () => {
      expect.assertions(1)
      const getQR = $httpBackend.expectPOST('/api/setup/qr').respond(()=> [403,'Incorrect code'])
      setupService.getQR('123456')
        .catch(err => {
          expect(err.status).toBe(403)
        })
        
      $httpBackend.flush()
    })

    test('Fail to get QR because already verified', () => {
      expect.assertions(1)
      const getQR = $httpBackend.expectPOST('/api/setup/qr').respond([])
      setupService.getQR('123456')
        .catch(err => {
          expect(err).toBe(0)
        })
        
      $httpBackend.flush()
    })

    test('Verify code', () => {
      expect.assertions(1)
      const getQR = $httpBackend.expectPOST('/api/setup/verify').respond('OK')
      setupService.verify('123456').then(res => {
        expect(res.status).toBe(200)
      })

      $httpBackend.flush()
    })

    test('Fail to verify code', () => {
      expect.assertions(1)
      const getQR = $httpBackend.expectPOST('/api/setup/verify').respond(()=> [403,''])
      setupService.verify('123456').catch(res => {
        expect(res.status).toBe(403)
      })

      $httpBackend.flush()
    })
  })

  describe('Controller', () => {
    let setupController, $rootScope, $controller, promiseOk, promiseResolve, $q, $location

    const setupService = {
      getQR: jest.fn().mockImplementation(fakePromise),
      verify: jest.fn().mockImplementation(fakePromise),
      printSetupCode: jest.fn().mockImplementation(fakePromise)
    }

    function fakePromise() {
      if (promiseOk) {
        return $q.resolve(promiseResolve)
      } else {
        return $q.reject('error')
      }
    }

    beforeEach(() => { 
      inject(function($injector) {
        $controller = $injector.get('$controller')
        $rootScope = $injector.get('$rootScope')
        $q = $injector.get('$q')
        $location = $injector.get('$location')
        setupController = $controller('setup', {setupService})
        $rootScope.$digest()
      })

      promiseOk = true
    })
    
    test('Init', () => {
      expect.assertions(1)
      promiseOk = false
      setupController = $controller('setup', {setupService})
      setupController.init()
      $rootScope.$digest()
      expect($location.path()).toBe('/home')
    })

    test('Init when already verified', () => {
      expect.assertions(1)
      setupController = $controller('setup', {setupService})
      setupController.init()
      $rootScope.$digest()
      expect(setupController.step).toBe('1')
    })

    test('Get QR', () => {
      expect.assertions(2)
      promiseResolve = 'qrcode'

      setupController.getQR('123456')
      $rootScope.$digest()
      expect(setupController.qr).toBeDefined()
      expect(setupController.step).toBe('2')
    })

    test('Fail to get QR', () => {
      expect.assertions(2)
      promiseOk = false

      setupController.getQR('123456')
      $rootScope.$digest()
      expect(setupController.qr).toBeUndefined()
      expect(setupController.step).toBeUndefined()
    })

    test('Verify code', () => {
      expect.assertions(2)
      promiseResolve = 'OK'

      setupController.verify('123456')
      $rootScope.$digest()
      expect(setupController.qr).toBeUndefined()
      expect(setupController.step).toBe('3')
    })

    test('Fail to verify code', () => {
      expect.assertions(2)
      promiseOk = false
      setupController.qr = 'qrcode'
      setupController.step = '2'
      setupController.verify('123456')
      $rootScope.$digest()
      expect(setupController.qr).toBe('qrcode')
      expect(setupController.step).toBe('2')
    })

  })
})