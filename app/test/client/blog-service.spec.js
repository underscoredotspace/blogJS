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

  test('should be a function', () => {
    expect(blogService.get).toEqual(jasmine.any(Function))
  })

  test('should get latest posts', () => {
    expect.assertions(1)
    const getLatest5 = $httpBackend.expectGET('/api/blog').respond([])
    blogService.get().then(res => {
      expect(res.status).toBe(200)
    })

    $httpBackend.flush()
  })

  test('should get page 2 of posts', () => {
    expect.assertions(1)
    const getLatest5 = $httpBackend.expectGET('/api/blog/page/2').respond([])
    blogService.get({page:2}).then(res => {
      expect(res.status).toBe(200)
    })

    $httpBackend.flush()
  })

  test('should get page 2 of posts and ignore id', () => {
    expect.assertions(1)
    const getLatest5 = $httpBackend.expectGET('/api/blog/page/2').respond([])
    blogService.get({page:2, id:'592c78780e0322032c845430'}).then(res => {
      expect(res.status).toBe(200)
    })

    $httpBackend.flush()
  })

  test('should get single post', () => {
    expect.assertions(1)
    const getSinglePost = $httpBackend.expectGET('/api/blog/id/592c78780e0322032c845430').respond([])
    blogService.get({id:'592c78780e0322032c845430'}).then(res => {
      expect(res.status).toBe(200)
    })

    $httpBackend.flush()
  })

  test('should delete single post', () => {
    expect.assertions(1)
    const deletePost = $httpBackend.expect('DELETE', '/api/blog/592c78780e0322032c845430').respond([])
    blogService.delete('592c78780e0322032c845430').then(res => {
      expect(res.status).toBe(200)
    })

    $httpBackend.flush()
  })

  test('should edit a post', () => {
    expect.assertions(1)
    const editPost = $httpBackend.expect('PATCH', '/api/blog/592c78780e0322032c845430')
      .respond({id:'592c78780e0322032c845430'})
    const post = {
      title: 'A title that is long enought to post',
      content: 'Content. You know, the nonsense you expect people to read. '
    }
    blogService.edit('592c78780e0322032c845430', post)
      .then(id => expect(id).toBe('592c78780e0322032c845430'))

    $httpBackend.flush()
  })

  test('should make a new post', () => {
    expect.assertions(1)
    const newPost = $httpBackend.expect('POST', '/api/blog').respond({id:'592c78780e0322032c845430'})
    const blogpost = {
      title: 'A title that is long enought to post',
      content: 'Content. You know, the nonsense you expect people to read. '
    }
    blogService.new(blogpost)
      .then(id => expect(id).toBe('592c78780e0322032c845430'))

      $httpBackend.flush()
  })

  // Failing conditions
  test('should fail to delete single post due to missing id', () => {
    expect.assertions(1)
    blogService.delete()
      .catch(err => expect(err).toBe('Post ID required'))
  })

  test('should fail to edit a post because post param is missing', () => {
    expect.assertions(1)
    blogService.edit('592c78780e0322032c845430')
      .catch(err => expect(err).toBe('Edited post required'))
  })

  test('should fail to edit a post because post id is missing', () => {
    expect.assertions(1)
    blogService.edit()
      .catch(err => expect(err).toBe('Post ID required'))
  })

  test('should fail to edit a post because title is too short', () => {
    expect.assertions(1)
    const post = {
      title: 'Hi',
      content: 'Content. You know, the nonsense you expect people to read. '
    }
    blogService.edit('592c78780e0322032c845430', post)
      .catch(err => expect(err).toBe('Title or content too short'))
  })

  test('should fail to edit a post because content is too short', () => {
    expect.assertions(1)
    const blogpost = {
      title: 'A title that is long enought to post',
      content: 'Hi'
    }
    blogService.edit('592c78780e0322032c845430', blogpost)
      .catch(err => expect(err).toBe('Title or content too short'))
  })

  test('should fail to make a new post because blogpost param is missing', () => {
    expect.assertions(1)
    blogService.new()
      .catch(err => expect(err).toBe('New post required'))
  })

  test('should fail to make new post because title is too short', () => {
    expect.assertions(1)
    const blogpost = {
      title: 'Hi',
      content: 'Content. You know, the nonsense you expect people to read. '
    }
    blogService.new(blogpost)
      .catch(err => expect(err).toBe('Title or content too short'))
  })

  test('should fail to make new post because content is too short', () => {
    expect.assertions(1)
    const blogpost = {
      title: 'A title that is long enought to post',
      content: 'Hi'
    }
    blogService.new(blogpost)
      .catch(err => expect(err).toBe('Title or content too short'))
  })
})