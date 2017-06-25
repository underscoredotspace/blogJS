describe('authService: Controls authentication', () => {
  let authService, $httpBackend, $rootScope
  beforeEach(() => {
    module('colonApp')

    inject(function($injector) {
      authService = $injector.get('authService')
      $httpBackend = $injector.get('$httpBackend')
    })
  })

  afterEach(() => {
    $httpBackend.verifyNoOutstandingExpectation()
    $httpBackend.verifyNoOutstandingRequest()
  })

  it('should contain a functions login, logout and isLoggedIn', () => {
    expect(authService.login).toEqual(jasmine.any(Function))
    expect(authService.logout).toEqual(jasmine.any(Function))
    expect(authService.isLoggedIn).toEqual(jasmine.any(Function))
  })

  it('should return logged in status as false', () => {
    expect(authService.isLoggedIn()).toEqual(false)
  })

  it('should log user in', () => {
    const login = $httpBackend.expectPOST('/api/login').respond({loggedin: true})
    authService.login(123456)
    .then(() => {
      const loggedin = authService.isLoggedIn()
      expect(loggedin).toBe(true)
    })
    .catch(err => expect(err).toBeUndefined())

    $httpBackend.flush()
  })

  it('should fail to log user in', () => {
    const login = $httpBackend.expectPOST('/api/login').respond({err: false, valid: false, verified: true})
    authService.login(123456)
    .then(res => expect(res).toBeUndefined())
    .catch(() => {
      const loggedin = authService.isLoggedIn()
      expect(loggedin).toBe(false)
    })

    $httpBackend.flush()
  })

  it('should log the user out', () => {
    const logout = $httpBackend.expectGET('/api/logout').respond([])
    authService.logout()
    .then(() => {
      const loggedin = authService.isLoggedIn()
      expect(loggedin).toBe(false)
    })

    $httpBackend.flush()
  })

  it('should fail to log user out because of http error', () => {
    const login = $httpBackend.expectPOST('/api/login').respond({loggedin: true})
    const logout = $httpBackend.expectGET('/api/logout').respond(500, '')

    authService.login(123456)
    .then(() => {
      const loggedin = authService.isLoggedIn()
      expect(loggedin).toBe(true)

      authService.logout()
      .then(res => expect(res).toBeUndefined())
      .catch(() => {
        const loggedin = authService.isLoggedIn()
        expect(loggedin).toBe(true)
      })

    }).catch(err => expect(err).toBeUndefined())

    $httpBackend.flush()
  })
})