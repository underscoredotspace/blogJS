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
  require('../../client/src/06-draft-service.js')

  let drafts, $rootScope, $controller

  beforeEach(() => {
    angular.mock.module('colonApp')

    inject(function($injector) {
      drafts = $injector.get('drafts')
      $rootScope = $injector.get('$rootScope')
      $controller = $injector.get('$controller')
    })
    jest.clearAllMocks()
    mockStorage.length = 0
  })

  test('draftService contain functions init, enabled, list, load and save', () => {
    expect.assertions(5)
    expect(drafts.init).toBeInstanceOf(Function)
    expect(drafts.load).toBeInstanceOf(Function)
    expect(drafts.save).toBeInstanceOf(Function)
    expect(drafts.enabled).toBeInstanceOf(Function)
    expect(drafts.list).toBeInstanceOf(Function)
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
    mockStorage.setItem.mockImplementationOnce(() => {throw('error')})
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

  test('Load success', () => {
    expect.assertions(2)
    const testDraft = {"title":"title","content":"content"}
    mockStorage.getItem.mockReturnValueOnce(JSON.stringify(testDraft))
    drafts.init().then(() => {
      drafts.load('uuid').then(draft => {
        expect(mockStorage.getItem).toHaveBeenCalledWith('uuid')
        expect(draft).toMatchObject(testDraft)
      })
    })
    $rootScope.$digest()
  })

  test('Save success', () => {
    expect.assertions(2)
    const testDraft = {title:'title',content:'content'}
    drafts.init().then(() => {
      drafts.save(testDraft).then(uuid => {
        expect(mockStorage.setItem).toHaveBeenLastCalledWith(uuid, "{\"title\":\"title\",\"content\":\"content\"}")
        expect(uuid).toBeDefined()
      })
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

  test('List drafts returns nothing', () => {
    expect.assertions(1)
    drafts.init().then(
      drafts.list().then(list => {
        expect(list).toMatchObject([])
      })
    )
    $rootScope.$digest()
  })

  test('List drafts returns list', () => {
    expect.assertions(3)
    mockStorage.length = 3
    mockStorage.getItem
      .mockReturnValueOnce(JSON.stringify({test:1}))
      .mockReturnValueOnce(JSON.stringify({test:2}))
      .mockReturnValueOnce(JSON.stringify({test:3}))

    drafts.init().then(
      drafts.list().then(list => {
        expect(mockStorage.getItem).toHaveBeenCalledTimes(3)
        expect(mockStorage.key).toHaveBeenCalledTimes(3)
        expect(list).toMatchObject([{test:1},{test:2},{test:3}])
      })
    )
    $rootScope.$digest()
  })
})