describe('Load latest 5 posts', function(){
  var blogService, apiPosts
  beforeEach(function() {
    module('colonApp')

    inject(function($injector) {
      blogService = $injector.get('blogService')

      $httpBackend = $injector.get('$httpBackend');
      apiPosts = $httpBackend.when('GET', /\/api\/latest\/[0-9]{0,2}/).respond([])
    })
  })

  afterEach(function() {
     $httpBackend.verifyNoOutstandingExpectation();
     $httpBackend.verifyNoOutstandingRequest();
   });

  it('should be a function', function() {
    expect(blogService.get).toEqual(jasmine.any(Function))
  })

  it('should call api', function() {
    blogService.get(null, function(err, res) {})
    $httpBackend.flush()
  })
})