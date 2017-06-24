describe('blogService: Completes API calls for blog posts', () => {
  let blogService, $httpBackend, $rootScope
  beforeEach(() => {
    module('colonApp')

    inject(function($injector) {
      blogService = $injector.get('blogService')
      $httpBackend = $injector.get('$httpBackend')
      $rootScope = $injector.get('$rootScope')
    })
  })

  afterEach(() => {
    $httpBackend.verifyNoOutstandingExpectation()
    $httpBackend.verifyNoOutstandingRequest()
  });

  it('should be a function', () => {
    expect(blogService.get).toEqual(jasmine.any(Function))
  })

  it('should get latest 5 posts', () => {
    const getLatest5 = $httpBackend.expectGET('/api/latest/5').respond([])
    blogService.get()
    .then($httpBackend.flush())
    .catch(err => expect(err).toBeUndefined())
  })

  it('should get single post', () => {
    const getSinglePost = $httpBackend.expectGET('/api/post/592c78780e0322032c845436').respond([])
    blogService.get('592c78780e0322032c845436')
    .then($httpBackend.flush())
    .catch(err => expect(err).toBeUndefined())
  })

  it('should delete single post', () => {
    const deletePost = $httpBackend.expect('DELETE', '/api/post/592c78780e0322032c845436').respond([])
    blogService.delete('592c78780e0322032c845436')
    .then($httpBackend.flush())
    .catch(err => expect(err).toBeUndefined())
  })

  it('should edit a post', () => {
    const editPost = $httpBackend.expect('PATCH', '/api/post/592c78780e0322032c845436').respond([])
    const post = {
      title: 'A title that iss long enought to post',
      content: 'Content. You know, the nonsense you expect people to read. '
    }
    blogService.edit('592c78780e0322032c845436', post)
    .then($httpBackend.flush())
    .catch(err => expect(err).toBeUndefined())
  })

  // Failing conditions
  it('should fail to edit a post because post param is missing', () => {
    blogService.edit('592c78780e0322032c845436')
    .then(res => expect(res).toBeUndefined())
    .catch(err => expect(err).toBe('Edited post required'))
  })

  it('should fail to edit a post because post id is missing', () => {
    blogService.edit()
    .then(res => expect(res).toBeUndefined())
    .catch(err => expect(err).toBe('Post ID required'))
  })
})