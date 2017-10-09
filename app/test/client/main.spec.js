describe('Client main', () => {
  require('angular')
  require('angular-cookies')
  require('angular-route')
  require('angular-sanitize')
  window.hljs = require('highlightjs')
  window.showdown = require('showdown')
  require('ng-showdown')
  require('angular-mocks')
  require('../../client/src/00-config.js')
  require('../../client/src/01-main.js')
  require('../../client/src/06-localDraft-service.js')

  let promiseOk, promiseResolve, $rootScope, $controller, $location, $filter, $q, $showdown

  const mockStorage = {
    setItem: jest.fn(),
    removeItem: jest.fn(),
    getItem: jest.fn().mockReturnValue('{\"test\":\"ok\"}')
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

    angular.mock.module('colonApp')

    inject(function($injector) {
      $rootScope = $injector.get('$rootScope')
      $controller = $injector.get('$controller')
      $location = $injector.get('$location')
      $filter = $injector.get('$filter')
      $q = $injector.get('$q')
    })
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

  describe('newController', () => {
    test('Redirect to /login when not logged in', () => {
      expect.assertions(1)
      const controller = $controller('new', {authService, blogService})
      $rootScope.$digest()
      expect($location.path()).toBe('/login')
    })

    test('Load new post page when logged in', () => {
      expect.assertions(3)
      authService.loggedin = true
      const controller = $controller('new', {authService, blogService})
      $rootScope.$digest()
      expect(controller.submitPost).toBeInstanceOf(Function)
      expect(controller.blogpost).toBeInstanceOf(Object)
      expect(controller.blogpost.hasOwnProperty('date')).toBeTruthy()
    })

    test('Should submit post to API and redirect to new post', () => {
      expect.assertions(2)
      authService.loggedin = true
      const blogpost = {title: 'title', content: 'content'}
      const controller = $controller('new', {authService, blogService})
      $rootScope.$digest()
      controller.submitPost(blogpost)
      $rootScope.$digest()
      expect(blogService.new).toHaveBeenCalledWith({content: 'content', title: 'title'})
      expect($location.path()).toBe('/post/ok')
    })
  })

  describe('editController', () => {

    test('Redirect to /login when not logged in', () => {
      expect.assertions(1)
      const controller = $controller('edit', {authService, blogService})
      $rootScope.$digest()
      expect($location.path()).toBe('/login')
    })

    test('Redirect to /home when bad id given', () => {
      expect.assertions(1)
      authService.loggedin = true
      const $routeParams = {id:'zzz'}
      const controller = $controller('edit', {authService, blogService, $routeParams})
      $rootScope.$digest()
      expect($location.path()).toBe('/home')
    })

    test('Load edit post page when logged in', () => {
      expect.assertions(4)
      authService.loggedin = true
      const $routeParams = {id:okOID}
      promiseResolve = {posts: [{title: 'title', content: 'content'}]}
      const controller = $controller('edit', {authService, blogService, $routeParams})
      $rootScope.$digest()
      expect(controller.submitPost).toBeInstanceOf(Function)
      expect(blogService.get).toHaveBeenCalledWith({id: okOID})
      expect(controller.blogpost.title).toBe('title')
      expect(controller.blogpost.content).toBe('content')
    })

    test('submits edited post', () => {
      expect.assertions(2)
      authService.loggedin = true
      const $routeParams = {id:okOID}
      promiseResolve = {posts: [{title: 'title', content: 'content'}]}
      const controller = $controller('edit', {authService, blogService, $routeParams})
      $rootScope.$digest()
      promiseResolve = okOID
      controller.submitPost(controller.blogpost)
      $rootScope.$digest()
      expect(blogService.edit).toHaveBeenCalledWith(okOID, {title: 'title', content: 'content'})
      expect($location.path()).toBe(`/post/${okOID}`)
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