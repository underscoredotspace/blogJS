describe('Draft localStorage Service', () => {
  const mockStorage = {
    setItem: jest.fn(() => {mockStorage.length++}),
    removeItem: jest.fn(() => {if (mockStorage.length>0) {mockStorage.length--}}),
    getItem: jest.fn().mockReturnValue('{\"test\":\"ok\"}'),
    clear: jest.fn(() => {mockStorage.length = 0}),
    key: jest.fn(() => 0),
    length: 0
  }

  window.localStorage = mockStorage

  require('angular')
  require('angular-mocks')

  const colonApp = angular.module('colonApp', [])
  require('../../client/src/06-localDraft-service.js')

  let localDraft, $rootScope, $controller

  beforeEach(() => {
    angular.mock.module('colonApp')

    inject(function($injector) {
      localDraft = $injector.get('localDraft')
      $rootScope = $injector.get('$rootScope')
      $controller = $injector.get('$controller')
    })
    jest.clearAllMocks()
    mockStorage.length = 0
  })

  test('draftService contain functions init, enabled, list, load and save', () => {
    expect.assertions(5)
    expect(localDraft.init).toBeInstanceOf(Function)
    expect(localDraft.load).toBeInstanceOf(Function)
    expect(localDraft.save).toBeInstanceOf(Function)
    expect(localDraft.enabled).toBeInstanceOf(Function)
    expect(localDraft.list).toBeInstanceOf(Function)
  })

  test('Initialisation ok', () => {
    expect.assertions(3)
    localDraft.init().then(() => {
      expect(localDraft.enabled()).toBeTruthy()
      localDraft.save('test').then(res => {
        expect(res).toBeTruthy()
      })
      localDraft.load().then(res => {
        expect(res).toBeTruthy()
      })
    })
    $rootScope.$digest()
  })

  test('Initialisation error', () => {
    expect.assertions(4)
    mockStorage.setItem.mockImplementationOnce(() => {throw('error')})
    localDraft.init().catch(err => {
      expect(err).toMatchObject({localStorage:'error'})
      expect(localDraft.enabled()).toBeFalsy()
      localDraft.save('test').catch(err => {
        expect(err).toBe('localStorage is not enabled')
      })
      localDraft.load().catch(err => {
        expect(err).toBe('localStorage is not enabled')
      })
    })
    $rootScope.$digest()
  })

  test('Load failure due to init not run', () => {
    expect.assertions(1)
    localDraft.load().catch(err => {
      expect(err).toBe('localStorage is not enabled')
    })
    $rootScope.$digest()
  })

  test('Load success', () => {
    expect.assertions(2)
    const testDraft = {title:'title',content:'content'}
    mockStorage.getItem.mockReturnValueOnce(JSON.stringify(testDraft))
    localDraft.init().then(() => {
      localDraft.load('id').then(draft => {
        expect(mockStorage.getItem).toHaveBeenCalledWith('id')
        expect(draft).toMatchObject(testDraft)
      })
    })
    $rootScope.$digest()
  })

  test('Save success', () => {
    expect.assertions(2)
    const testDraft = {title:'title',content:'content'}
    localDraft.init().then(() => {
      localDraft.save(testDraft).then(id => {
        expect(mockStorage.setItem).toHaveBeenLastCalledWith(id, '{\"title\":\"title\",\"content\":\"content\"}')
        expect(id).toBeDefined()
      })
    })
    $rootScope.$digest()
  })

  test('Save success with id included already', () => {
    expect.assertions(2)
    const testDraft = {_id: '1', title:'title',content:'content'}
    localDraft.init().then(() => {
      localDraft.save(testDraft).then(id => {
        expect(mockStorage.setItem).toHaveBeenLastCalledWith('1', '{\"_id\":\"1\",\"title\":\"title\",\"content\":\"content\"}')
        expect(id).toBe('1')
      })
    })
    $rootScope.$digest()
  })

  test('Save failure due to init not run', () => {
    expect.assertions(1)
    localDraft.save('test').catch(err => {
      expect(err).toBe('localStorage is not enabled')
    })
    $rootScope.$digest()
  })

  test('List localDraft returns list', () => {
    expect.assertions(3)
    mockStorage.length = 3
    mockStorage.getItem
      .mockReturnValueOnce(JSON.stringify({test:1}))
      .mockReturnValueOnce(JSON.stringify({test:2}))
      .mockReturnValueOnce(JSON.stringify({test:3}))

    localDraft.init().then(
      localDraft.list().then(list => {
        expect(mockStorage.getItem).toHaveBeenCalledTimes(3)
        expect(mockStorage.key).toHaveBeenCalledTimes(3)
        expect(list).toMatchObject([{test:1},{test:2},{test:3}])
      })
    )
    $rootScope.$digest()
  })

  test('List localDraft returns empty list', () => {
    expect.assertions(3)
    mockStorage.length = 0

    localDraft.init().then(
      localDraft.list().then(list => {
        expect(mockStorage.getItem).not.toHaveBeenCalled()
        expect(mockStorage.key).not.toHaveBeenCalled()
        expect(list).toMatchObject([])
      })
    )
    $rootScope.$digest()
  })

  test('List localDraft returns error as not enabled', () => {
    expect.assertions(1)

      localDraft.list().catch(err => {
        expect(err).toBe('localStorage is not enabled')
      })
    $rootScope.$digest()
  })
})