describe('Load latest posts', () => {
  let blogService, apiPosts, $httpBackend
  beforeEach(() => {
    module('colonApp')

    inject(function($injector) {
      blogService = $injector.get('blogService')
      $httpBackend = $injector.get('$httpBackend')

      apiPosts = $httpBackend.when('GET', /\/api\/latest\/[0-9]{0,2}/).respond([])
    })
  })

  afterEach(() => {
     $httpBackend.verifyNoOutstandingExpectation()
     $httpBackend.verifyNoOutstandingRequest()
   });

  it('should be a function', () => {
    expect(blogService.get).toEqual(jasmine.any(Function))
  })

  it('should call api', () => {
    blogService.get(null, (err, res) => {})
    $httpBackend.flush()
  })
})