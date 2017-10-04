describe('Draft localStorage Service', () => {
  mockStorage = {
    setItem: jest.fn(),
    removeItem: jest.fn(),
    getItem: jest.fn(() => '{\"test\":\"ok\"}')
  }

  localStorage = mockStorage

  require('angular')
  require('angular-mocks')

  const colonApp = angular.module('colonApp', [])
  require('../../client/src/06-draft-service.js')

  let drafts, $rootScope, $controller

  beforeEach(() => {
    angular.mock.module('colonApp')

    inject(function($injector) {
      drafts = $injector.get('drafts')
      $rootScope = $injector.get('$rootScope')
      $controller = $injector.get('$controller')
    })
  })

  test('draftService contain functions init, enabled, load and save', () => {
    expect.assertions(4)
    expect(drafts.init).toBeInstanceOf(Function)
    expect(drafts.load).toBeInstanceOf(Function)
    expect(drafts.save).toBeInstanceOf(Function)
    expect(drafts.enabled).toBeInstanceOf(Function)
  })

  test('Initialisation ok', () => {
    expect.assertions(3)
    drafts.init().then(() => {
      expect(drafts.enabled()).toBeTruthy()
      drafts.save('test').then(res => {
        expect(res).toBeTruthy()
      })
      drafts.load().then(res => {
        expect(res).toBeTruthy()
      })
    })
    $rootScope.$digest()
  })

  test('Initialisation error', () => {
    expect.assertions(4)
    mockStorage.setItem.mockImplementation(() => {throw('error')})
    drafts.init().catch(err => {
      expect(err).toMatchObject({localStorage:'error'})
      expect(drafts.enabled()).toBeFalsy()
      drafts.save('test').catch(err => {
        expect(err).toBe('localStorage is not enabled')
      })
      drafts.load().catch(err => {
        expect(err).toBe('localStorage is not enabled')
      })
    })
    $rootScope.$digest()
  })

  test('Load failure due to init not run', () => {
    expect.assertions(1)
    drafts.load().catch(err => {
      expect(err).toBe('localStorage is not enabled')
    })
    $rootScope.$digest()
  })

  test('Save failure due to init not run', () => {
    expect.assertions(1)
    drafts.save('test').catch(err => {
      expect(err).toBe('localStorage is not enabled')
    })
    $rootScope.$digest()
  })
})