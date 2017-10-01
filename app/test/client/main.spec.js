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

  let promiseOk, promiseResolve, $rootScope, $controller, $location, $filter, $q, $showdown
  
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
    it('Reflects us being logged in', () => {
      authService.loggedin = true
      const controller = $controller('blogController', {authService:authService})
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

  describe('postController', () => {
    it('should load latest posts with no next page', () => {
      promiseResolve = {posts:['test', 'test2']}
      const controller = $controller('post', {blogService})
      $rootScope.$digest()
      expect(controller.postEdit).toBeInstanceOf(Function)
      expect(controller.postDelete).toBeInstanceOf(Function)
      expect(blogService.get).toHaveBeenCalledWith({id: undefined, page: undefined})
      expect(controller.blogposts[1]).toBe('test2')
      expect(controller.blogposts.length).toBe(2)
    })

    it('should load latest posts has next page', () => {
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
      promiseOk = false
      const controller = $controller('post', {blogService})
      $rootScope.$digest()
      expect(controller.blogposts).toBeUndefined()
    })

    it('should load specific post', () => {
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

    it('should not load specific post cos id is bad', () => {
      const routeParams = {id:'zzz'}
      const controller = $controller('post', {blogService, $routeParams:routeParams})
      $rootScope.$digest()
      expect($location.path()).toBe('/home')
    })

    it('should load page 2', () => {
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

    it('test edit', () => {
      const controller = $controller('post', {blogService})
      controller.postEdit('595f70031e019e7f2a7aa121')
      $rootScope.$digest()
      expect($location.path()).toBe('/edit/595f70031e019e7f2a7aa121')
    })

    it('test delete while at post/:id', () => {
      promiseResolve = {posts:['test']}
      const routeParams = {id:'595f70031e019e7f2a7aa121'}
      const controller = $controller('post', {blogService, $routeParams:routeParams})
      controller.postDelete('595f70031e019e7f2a7aa121')
      $rootScope.$digest()
      expect($location.path()).toBe('/home')
    })

    it('delete while at home', () => {
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
    it('Redirect to /login when not logged in', () => {
      const controller = $controller('new', {authService, blogService})
      $rootScope.$digest()
      expect($location.path()).toBe('/login')
    })

    it('Load new post page when logged in', () => {
      authService.loggedin = true
      const controller = $controller('new', {authService, blogService})
      $rootScope.$digest()
      expect(controller.submitPost).toBeInstanceOf(Function)
      expect(controller.blogpost).toBeInstanceOf(Object)
      expect(controller.blogpost.hasOwnProperty('date')).toBeTruthy()
    })

    it('Should submit post to API and redirect to new post', () => {
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

    it('Redirect to /login when not logged in', () => {
      const controller = $controller('edit', {authService, blogService})
      $rootScope.$digest()
      expect($location.path()).toBe('/login')
    })

    it('Redirect to /home when bad id given', () => {
      authService.loggedin = true
      const $routeParams = {id:'zzz'}
      const controller = $controller('edit', {authService, blogService, $routeParams})
      $rootScope.$digest()
      expect($location.path()).toBe('/home')
    })

    it('Load edit post page when logged in', () => {
      authService.loggedin = true
      const $routeParams = {id:okOID}
      promiseResolve = {posts: [{title: 'title', content: 'content'}]}
      const controller = $controller('edit', {authService, blogService, $routeParams})
      $rootScope.$digest()
      expect(controller.submitPost).toBeInstanceOf(Function)
      expect(blogService.get).toHaveBeenCalledWith({id: okOID})
      expect(controller.blogpost.title).toBe('title')
      expect(controller.blogpost.content).toBe('content')
      controller.submitPost(okOID, controller.blogpost)
      $rootScope.$digest()
      expect()
    })

    it('submits edited post', () => {
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
    it('Should log us out', () => {
      authService.loggedin = true
      const controller = $controller('logout', {authService})
      expect(authService.logout).toHaveBeenCalled()    
      expect($location.path()).toBe('/home')  
    })

    it('Should just go home cos we\'re not logged in', () => {
      authService.loggedin = false
      const controller = $controller('logout', {authService})
      expect(authService.logout).not.toHaveBeenCalled()  
      expect($location.path()).toBe('/home')
    })
  })

  describe('loginController', () => {
    it('Should log us in', () => {
      authService.loggedin = false
      const controller = $controller('login', {authService:authService})
      expect(controller.login).toBeInstanceOf(Function)
      controller.login()
      $rootScope.$digest()
      expect($location.path()).toBe('/home')  
    })

    it('Should just go home cos we\'re already logged in', () => {
      authService.loggedin = true
      const controller = $controller('login', {authService:authService})
      expect(controller.login).toBeUndefined()
      expect($location.path()).toBe('/home')
    })
  })
})