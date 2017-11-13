describe('Client main', () => {
  require('angular')
  require('angular-cookies')
  require('angular-route')
  require('angular-sanitize')
  require('angular-mocks')
  require('../../client/src/00-config.js')
  require('../../client/src/01-controllers.js')
  require('../../client/src/06-localDraft-service.js')

  let promiseOk, promiseResolve, $rootScope, $controller, $location, $filter, $q, $scope

  const mockStorage = {
    setItem: jest.fn(),
    removeItem: jest.fn(),
    getItem: jest.fn().mockReturnValue('{\"test\":\"ok\"}'),
    length: 0,
    key: jest.fn()
  }

  window.localStorage = mockStorage
  
  const authService = {
    loggedin: false,
    isLoggedIn: jest.fn().mockImplementation(() => authService.loggedin),
    logout: jest.fn().mockImplementation(fakePromise),
    login: jest.fn().mockImplementation(fakePromise)
  }
  
  const okOID = '592c78780e0322032c845430'

  const blogService = {
    get: jest.fn().mockImplementation(fakePromise),
    delete: jest.fn().mockImplementation(fakePromise),
    edit: jest.fn().mockImplementation(fakePromise),
    new: jest.fn().mockImplementation(fakePromise)
  }

  const md2html = jest.fn()

  function fakePromise() {
    if (promiseOk) {
      return $q.resolve(promiseResolve)
    } else {
      return $q.reject('error')
    }
  }

  beforeEach(() => {
    authService.loggedin = false

    promiseOk = true
    promiseResolve = 'ok'
    jest.clearAllMocks()
    mockStorage.length = 0

    angular.mock.module('colonApp')

    inject(function($injector) {
      $rootScope = $injector.get('$rootScope')
      $controller = $injector.get('$controller')
      $location = $injector.get('$location')
      $filter = $injector.get('$filter')
      $q = $injector.get('$q')
      $scope = $rootScope.$new()
    })

    md2html.mockReturnValue($q.resolve('html'))
  })

  describe('blogController', () => {
    test('Reflects us being logged in', () => {
      expect.assertions(2)
      authService.loggedin = true
      const controller = $controller('blogController', {authService:authService})
      $rootScope.$broadcast('auth-status')
      expect(authService.isLoggedIn).toHaveBeenCalled()
      expect(controller.loggedin).toEqual(true);
    })

    test('Reflects us being not logged in', () => {
      expect.assertions(2)
      authService.loggedin = false
      var controller = $controller('blogController', {authService:authService})
      $rootScope.$broadcast('auth-status')
      expect(authService.isLoggedIn).toHaveBeenCalled()
      expect(controller.loggedin).toEqual(false);
    })
  })

  describe('postController', () => {
    test('should load latest posts with no next page', () => {
      expect.assertions(5)
      promiseResolve = {posts:['test', 'test2']}
      const controller = $controller('post', {blogService})
      $rootScope.$digest()
      expect(controller.postEdit).toBeInstanceOf(Function)
      expect(controller.postDelete).toBeInstanceOf(Function)
      expect(blogService.get).toHaveBeenCalledWith({id: undefined, page: undefined})
      expect(controller.blogposts[1]).toBe('test2')
      expect(controller.blogposts.length).toBe(2)
    })

    test('should load latest posts has next page', () => {
      expect.assertions(7)
      promiseResolve = {posts:['test', 'test2'], more:true}
      const controller = $controller('post', {blogService})
      $rootScope.$digest()
      expect(controller.postEdit).toBeInstanceOf(Function)
      expect(controller.postDelete).toBeInstanceOf(Function)
      expect(blogService.get).toHaveBeenCalledWith({id: undefined, page: undefined})
      expect(controller.blogposts[1]).toBe('test2')
      expect(controller.blogposts.length).toBe(2)
      expect(controller.prev).toBeUndefined()
      expect(controller.next).toBe(2)
    })

    test('Handle error from blogservice.get', () => {
      expect.assertions(1)
      promiseOk = false
      const controller = $controller('post', {blogService})
      $rootScope.$digest()
      expect(controller.blogposts).toBeUndefined()
    })

    test('should load specific post', () => {
      expect.assertions(5)
      promiseResolve = {posts:['test']}
      const routeParams = {id: okOID}
      const controller = $controller('post', {blogService, $routeParams:routeParams})
      $rootScope.$digest()
      expect(controller.postEdit).toBeInstanceOf(Function)
      expect(controller.postDelete).toBeInstanceOf(Function)
      expect(blogService.get).toHaveBeenCalledWith({page: undefined, id:routeParams.id})
      expect(controller.blogposts[0]).toBe('test')
      expect(controller.prev).toBeUndefined()
    })

    test('should not load specific post cos id is bad', () => {
      expect.assertions(1)
      const routeParams = {id:'zzz'}
      const controller = $controller('post', {blogService, $routeParams:routeParams})
      $rootScope.$digest()
      expect($location.path()).toBe('/home')
    })

    test('should load page 2', () => {
      expect.assertions(5)
      promiseResolve = {posts:['test']}
      const routeParams = {page: 2}
      const controller = $controller('post', {blogService, $routeParams:routeParams})
      $rootScope.$digest()
      expect(controller.postEdit).toBeInstanceOf(Function)
      expect(controller.postDelete).toBeInstanceOf(Function)
      expect(blogService.get).toHaveBeenCalledWith({page: 2, id: undefined})
      expect(controller.blogposts[0]).toBe('test')
      expect(controller.prev).toBe(1)
    })

    test('test edit', () => {
      expect.assertions(1)
      const controller = $controller('post', {blogService})
      controller.postEdit('595f70031e019e7f2a7aa121')
      $rootScope.$digest()
      expect($location.path()).toBe('/edit/595f70031e019e7f2a7aa121')
    })

    test('test delete while at post/:id', () => {
      expect.assertions(1)
      promiseResolve = {posts:['test']}
      const routeParams = {id:'595f70031e019e7f2a7aa121'}
      const controller = $controller('post', {blogService, $routeParams:routeParams})
      controller.postDelete('595f70031e019e7f2a7aa121')
      $rootScope.$digest()
      expect($location.path()).toBe('/home')
    })

    test('delete while at home', () => {
      expect.assertions(1)
      promiseResolve = {posts:[
        {_id: '595f70031e019e7f2a7aa121'},
        {_id: '595f70031e019e7f2a7aa128'}
      ]}
      const controller = $controller('post', {blogService})
      controller.postDelete('595f70031e019e7f2a7aa121')
      $rootScope.$digest()
      expect(controller.blogposts.length).toBe(1)
    })
  })

  describe('editController', () => {
    test('Redirect to /login when not logged in', () => {
      expect.assertions(1)
      const controller = $controller('edit', {authService, blogService, md2html, $scope})
      $rootScope.$digest()
      expect($location.path()).toBe('/login')
    })

    test('Load edit post page when logged in', () => {
      expect.assertions(4)
      authService.loggedin = true
      mockStorage.getItem.mockReturnValueOnce(null)
      const $routeParams = {id:okOID}
      promiseResolve = {posts: [{title: 'title', content: 'content'}]}
      const controller = $controller('edit', {authService, blogService, md2html, $routeParams, $scope})
      $rootScope.$digest()
      expect(controller.submitPost).toBeInstanceOf(Function)
      expect(blogService.get).toHaveBeenCalledWith({id: okOID})
      expect(controller.blogpost.title).toBe('title')
      expect(controller.blogpost.content).toBe('content')
    })

    test('load edit post page and get existing draft', () => {
      expect.assertions(3)
      authService.loggedin = true
      mockStorage.getItem.mockReturnValueOnce(JSON.stringify({id:okOID, title:'title', content: 'content'}))
      const $routeParams = {id:okOID}
      const controller = $controller('edit', {authService, blogService, md2html, $routeParams, $scope})
      $rootScope.$digest()
      expect(blogService.get).not.toHaveBeenCalled()
      expect(controller.blogpost.title).toBe('title')
      expect(controller.blogpost.content).toBe('content')
    })

    test('submit new post', () => {
      expect.assertions(2)
      mockStorage.getItem
        .mockReturnValueOnce({id:123, test:'something'})
        .mockReturnValueOnce(null)
      const blogPost = {_id: '123', title: 'title', content: 'content'}
      authService.loggedin = true
      const controller = $controller('edit', {authService, blogService, md2html, $scope})
      controller.blogpost = blogPost
      $rootScope.$digest()
      controller.submitPost(controller.blogpost)
      $rootScope.$digest()
      expect(blogService.new).toHaveBeenCalledWith(blogPost)
      expect(mockStorage.removeItem).toHaveBeenCalled()
    })

    test('submits edited post', () => {
      expect.assertions(2)
      authService.loggedin = true
      mockStorage.getItem
        .mockReturnValueOnce(null)
        .mockReturnValueOnce(JSON.stringify({id:123, test:'something'}))
        .mockReturnValueOnce(null)
      const $routeParams = {id:okOID}
      promiseResolve = {posts: [{title: 'title', content: 'content'}]}
      const controller = $controller('edit', {authService, blogService, md2html, $routeParams, $scope})
      $rootScope.$digest()
      promiseResolve = okOID
      controller.submitPost(controller.blogpost)
      $rootScope.$digest()
      expect(blogService.edit).toHaveBeenCalledWith(okOID, {title: 'title', content: 'content'})
      expect($location.path()).toBe(`/post/${okOID}`)
    })

    test('save localDraft from /new', () => {
      expect.assertions(2)
      authService.loggedin = true
      const blogPost = {title: 'title', content: 'content'}
      const controller = $controller('edit', {authService, blogService, md2html, $scope})
      $rootScope.$digest()
      controller.blogpost = blogPost
      controller.lsSave(blogPost, {'$valid':true})
      $rootScope.$digest()
      expect(blogPost._id.substr(0,2)).toBe('d-')
      expect(controller.saved).toBeTruthy()
    })

    test('load localDraft from /new', () => {
      expect.assertions(2)
      authService.loggedin = true
      mockStorage.length = 2
      mockStorage.getItem
        .mockReturnValueOnce(JSON.stringify({'_id':'ef123', test:'something'}))
        .mockReturnValueOnce(JSON.stringify({'_id':'d-123', test:'something new'}))
      const controller = $controller('edit', {authService, blogService, md2html, $scope})
      $rootScope.$digest()
      controller.loadDraft('d-123')
      $rootScope.$digest()
      expect(mockStorage.getItem).toHaveBeenCalledWith('d-123')
      expect(controller.saved).toBeTruthy()
    })

    test('localDraft not saved as post is not valid yet', () => {
      expect.assertions(2)
      authService.loggedin = true
      const blogPost = {title: 'title', content: 'content'}
      const controller = $controller('edit', {authService, blogService, md2html, $scope})
      $rootScope.$digest()
      controller.blogpost = blogPost
      controller.lsSave(blogPost, {'$valid':false})
      $rootScope.$digest()
      expect(blogPost._id).toBeUndefined()
      expect(controller.saved).toBeFalsy()
    })

    test('localDraft not saved due to ls error', () => {
      expect.assertions(2)
      authService.loggedin = true
      const blogPost = {title: 'title', content: 'content'}
      const controller = $controller('edit', {authService, blogService, md2html, $scope})
      $rootScope.$digest()
      controller.blogpost = blogPost
      mockStorage.setItem.mockImplementationOnce(() => {
        throw('oh fuck')
      })
      controller.lsSave(blogPost, {'$valid':true})
      $rootScope.$digest()
      expect(blogPost._id).toBeUndefined()
      expect(controller.saved).toBeFalsy()
    })

    test('localDraft not saved as draftService unavailable', () => {
      expect.assertions(2)
      authService.loggedin = true
      
      const controller = $controller('edit', {authService, blogService, md2html, $scope})
      $rootScope.$digest()
      mockStorage.setItem.mockClear()
      controller.lsEnabled = false
      const blogPost = {title: 'title', content: 'content'}
      controller.lsSave(blogPost, {'$valid':true})
      expect(mockStorage.setItem).not.toBeCalled()
      expect(controller.saved).toBeFalsy()
    })
  })

  describe('logoutController', () => {
    test('Should log us out', () => {
      expect.assertions(2)
      authService.loggedin = true
      const controller = $controller('logout', {authService})
      expect(authService.logout).toHaveBeenCalled()    
      expect($location.path()).toBe('/home')  
    })

    test('Should just go home cos we\'re not logged in', () => {
      expect.assertions(2)
      authService.loggedin = false
      const controller = $controller('logout', {authService})
      expect(authService.logout).not.toHaveBeenCalled()  
      expect($location.path()).toBe('/home')
    })
  })

  describe('loginController', () => {
    test('Should log us in', () => {
      expect.assertions(2)
      authService.loggedin = false
      const controller = $controller('login', {authService:authService})
      expect(controller.login).toBeInstanceOf(Function)
      controller.login()
      $rootScope.$digest()
      expect($location.path()).toBe('/home')  
    })

    test('Should just go home cos we\'re already logged in', () => {
      expect.assertions(2)
      authService.loggedin = true
      const controller = $controller('login', {authService:authService})
      expect(controller.login).toBeUndefined()
      expect($location.path()).toBe('/home')
    })
  })
})