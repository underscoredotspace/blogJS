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
require('../../client/src/03-blog-service.js')

describe('blogService: Completes API calls for blog posts', () => {
  let blogService, $httpBackend, $rootScope
  beforeEach(() => {
    angular.mock.module('colonApp')

    inject(function($injector) {
      blogService = $injector.get('blogService')
      $httpBackend = $injector.get('$httpBackend')
    })
  })

  afterEach(() => {
    $httpBackend.verifyNoOutstandingExpectation()
    $httpBackend.verifyNoOutstandingRequest()
  });

  it('should be a function', () => {
    expect(blogService.get).toEqual(jasmine.any(Function))
  })

  it('should get latest posts', () => {
    const getLatest5 = $httpBackend.expectGET('/api/blog/').respond([])
    blogService.get()
    .then($httpBackend.flush())
    .catch(err => expect(err).toBeUndefined())
  })

  it('should get page 2 of posts', () => {
    const getLatest5 = $httpBackend.expectGET('/api/blog/2').respond([])
    blogService.get({page:2})
    .then($httpBackend.flush())
    .catch(err => expect(err).toBeUndefined())
  })

  it('should get page 2 of posts and ignore id', () => {
    const getLatest5 = $httpBackend.expectGET('/api/blog/2').respond([])
    blogService.get({page:2, id:'592c78780e0322032c845430'})
    .then($httpBackend.flush())
    .catch(err => expect(err).toBeUndefined())
  })

  it('should get single post', () => {
    const getSinglePost = $httpBackend.expectGET('/api/blog/id/592c78780e0322032c845430').respond([])
    blogService.get({id:'592c78780e0322032c845430'})
    .then($httpBackend.flush())
    .catch(err => expect(err).toBeUndefined())
  })

  it('should delete single post', () => {
    const deletePost = $httpBackend.expect('DELETE', '/api/post/592c78780e0322032c845430').respond([])
    blogService.delete('592c78780e0322032c845430')
    .then($httpBackend.flush())
    .catch(err => expect(err).toBeUndefined())
  })

  it('should edit a post', () => {
    const editPost = $httpBackend.expect('PATCH', '/api/post/592c78780e0322032c845430').respond([])
    const post = {
      title: 'A title that is long enought to post',
      content: 'Content. You know, the nonsense you expect people to read. '
    }
    blogService.edit('592c78780e0322032c845430', post)
    .then($httpBackend.flush())
    .catch(err => expect(err).toBeUndefined())
  })

  it('should make a new post', () => {
    const newPost = $httpBackend.expect('POST', '/api/post').respond({id:'592c78780e0322032c845430'})
    const blogpost = {
      title: 'A title that is long enought to post',
      content: 'Content. You know, the nonsense you expect people to read. '
    }
    blogService.new(blogpost)
      .then(id => expect(id).toBe('592c78780e0322032c845430'))
      .catch(err => expect(err).toBeUndefined())

      $httpBackend.flush()
  })

  // Failing conditions
  it('should fail to delete single post due to missing id', () => {
    blogService.delete()
    .then(res => expect(res).toBeUndefined())
    .catch(err => expect(err).toBe('Post ID required'))
  })

  it('should fail to edit a post because post param is missing', () => {
    blogService.edit('592c78780e0322032c845430')
    .then(res => expect(res).toBeUndefined())
    .catch(err => expect(err).toBe('Edited post required'))
  })

  it('should fail to edit a post because post id is missing', () => {
    blogService.edit()
    .then(res => expect(res).toBeUndefined())
    .catch(err => expect(err).toBe('Post ID required'))
  })

  it('should fail to edit a post because title is too short', () => {
    const post = {
      title: 'Hi',
      content: 'Content. You know, the nonsense you expect people to read. '
    }
    blogService.edit('592c78780e0322032c845430', post)
    .then(res => expect(res).toBeUndefined())
    .catch(err => expect(err).toBe('Title or content too short'))
  })

  it('should fail to edit a post because content is too short', () => {
    const blogpost = {
      title: 'A title that is long enought to post',
      content: 'Hi'
    }
    blogService.edit('592c78780e0322032c845430', blogpost)
    .then(res => expect(res).toBeUndefined())
    .catch(err => expect(err).toBe('Title or content too short'))
  })

  it('should fail to make a new post because blogpost param is missing', () => {
    blogService.new()
      .then(id => expect(id).toBeUndefined())
      .catch(err => expect(err).toBe('New post required'))
  })

  it('should fail to make new post because title is too short', () => {
    const blogpost = {
      title: 'Hi',
      content: 'Content. You know, the nonsense you expect people to read. '
    }
    blogService.new(blogpost)
    .then(id => expect(id).toBeUndefined())
    .catch(err => expect(err).toBe('Title or content too short'))
  })

  it('should fail to make new post because content is too short', () => {
    const blogpost = {
      title: 'A title that is long enought to post',
      content: 'Hi'
    }
    blogService.new(blogpost)
    .then(id => expect(id).toBeUndefined())
    .catch(err => expect(err).toBe('Title or content too short'))
  })
})