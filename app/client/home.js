(function() {
  angular.module('colonApp', ['ngRoute', 'ngCookies', 'ng-showdown'])
})();

(function(){
    angular.module('colonApp').config(configConfig)
    configConfig.$inject = ['$routeProvider', '$showdownProvider']

    function configConfig($routeProvider, $showdownProvider) {
      routerConfig($routeProvider)
      showdownConfig($showdownProvider)
    }

    function routerConfig($routeProvider) {
      $routeProvider
      .when('/about', {
        templateUrl: 'part/about.html'
      })
      .when('/home', {
        templateUrl: 'part/posts.html',
        controller: 'home'
      })
      .when('/home/:page', {
        templateUrl: 'part/posts.html',
        controller: 'home'
      })
      .when('/post/:id', {
        templateUrl: 'part/posts.html',
        controller: 'post'
      })
      .when('/new', {
        templateUrl: 'part/newpost.html',
        controller: 'new'
      })
      .when('/edit/:id', {
        templateUrl: 'part/newpost.html',
        controller: 'edit'
      })
      .when('/login', {
        templateUrl: 'part/login.html',
        controller: 'login'
      })
      .when('/logout', {
        template: '<div class="part">Logging out...</div>',
        controller: 'logout'
      })
      .when('/setup/', {
        templateUrl: 'part/setup.html',
        controller: 'setup'
      })
      .otherwise({redirectTo:'/home'})
    }

    function showdownConfig($showdownProvider) {
      window.showdown.extension('codehighlight', codeHighlight)
      $showdownProvider.loadExtension('codehighlight')

      function codeHighlight() {
        const htmlunencode = (text) => text.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
        
        function filterFunction(text, converter, options) {
          // use new showdown's regexp engine to conditionally parse codeblocks
          var left  = '<code\\b[^>]*>',
              right = '</code>',
              flags = 'g',
              replacement = (wholeMatch, match, left, right) => {
                // unescape match to prevent double escaping
                match = htmlunencode(match)
                return left + window.hljs.highlightAuto(match).value + right
              }
          return window.showdown.helper.replaceRecursiveRegExp(text, replacement, left, right, flags)
        }
        
        return [
          {
            type: 'output',
            filter: filterFunction
          }
        ]
      }
    }

})();

(function(){
  angular.module('colonApp').config(noDebug)
  noDebug.$inject = ['$compileProvider']

  function noDebug($compileProvider) {
    $compileProvider.debugInfoEnabled(false)
    $compileProvider.commentDirectivesEnabled(false)
  }
})();

(function(){
  angular.module('colonApp').controller('blogController', blogController)
  blogController.$inject = ['$cookies']

  function blogController($cookies) {
    const vm = this
    vm.loggedin = false
    if($cookies.get('qqBlog')) {
      vm.loggedin = true
    }
  }
})();

(function() {
  angular.module('colonApp').directive('blogPost', blogPost)

  function blogPost() {
    const directive = {
      restrict: 'C',
      controller: blogPostController,
      controllerAs: 'vm'
    }

    blogPostController.$inject = ['$http', '$filter', '$location']

    function blogPostController($http, $filter, $location) {
      const vm = this
      vm.postDelete = function(id) {
        $http({
          method: 'delete',
          url: '/api/post/' + id,
          headers: {'Content-Type': 'application/json'}
        }).then(function(res) {
          console.log('deleted', id)
          vm.$parent.blogposts = $filter('filter')(vm.$parent.blogposts, {'_id': '!' + id});
          if($location.path() === '/post/' + id) {
            $location.path('/')
          }
        }).catch(function(err, res) {
          console.log(err)
          console.log(res)
        })
      }

      vm.postEdit = function(id) {
        console.log('edit', id)
        $location.path('/edit/' + id)
      }
    }

    return directive
  }
})();

(function() {
  angular.module('colonApp').controller('logout', logoutController)
  logoutController.$inject = ['$scope', '$http', '$location']

  function logoutController($scope, $http, $location) {
    if (!$scope.$parent.blog.loggedin) {
      $location.path('/home')
    } else {
      $http.get('/api/logout')
      .then(function(res) {
        $scope.$parent.blog.loggedin = false
        $location.path('/home')
      }, function(res) {
        console.error(res)
        $scope.$parent.blog.loggedin = false
        $location.path('/home')
      })
    }
  }
})();

(function() {
  angular.module('colonApp').controller('home', homeController)
  homeController.$inject = ['$scope', 'blogService']

  function homeController($scope, blog) {
    blog.get()
    .then(posts => $scope.blogposts = posts.data)
    .catch(err => console.error)
  }
})();

(function() {
  angular.module('colonApp').controller('post', postController)
  postController.$inject = ['$scope', '$routeParams', '$location', '$timeout', 'blogService']

  function postController($scope, $routeParams, $location, $timeout, blog) {
    function postError(err, gohome) {
      $scope.$parent.error = err
      if (gohome) {
        $timeout(function() {
          $scope.$parent.error = null
          $location.path('/home')
        }, 3000)
      }
    }

    const oIDRegEx = /[0-9a-fA-F]{24}/i
    if (!oIDRegEx.test($routeParams.id)) {
      postError('Invalid post. Going home...', true)
    } else {
      blog.get($routeParams.id)
      .then(posts => $scope.blogposts = posts.data)
      .catch(err => console.error)
    }
  }
})();

(function() {
  angular.module('colonApp').controller('new', newController)
  newController.$inject = ['$scope', '$http', '$location']
  function newController($scope, $http, $location) {
    if (!$scope.$parent.blog.loggedin) {
      $location.path('/login')
    } else {
      $scope.blogpost = {
        title: '',
        content: '',
        date: new Date()
      }

      $scope.submitPost = function() {
        var blogpost = {
          title: $scope.blogpost.title,
          content: $scope.blogpost.content
        }
        $http({
            url: '/api/new',
            method: 'POST',
            data: {blogpost: blogpost},
            headers: {'Content-Type': 'application/json'}
        }).then(function(res) {
          if(res.data.hasOwnProperty('ID')) {
            $location.path('/post/'+ res.data.ID)
          }
        }, function(err) {
            console.error(err.data)
        })
      }
    }
  }
})();

(function() {
  angular.module('colonApp').controller('edit', editController)
  editController.$inject = ['$scope', 'blogService', '$routeParams', '$location', '$http']
  function editController($scope, blog, $routeParams, $location, $http) {
    blog.get($routeParams.id, function(err, data) {
      if (!err) {
        if (data.status===204) {
          console.info('Post doesn\'t exist')
          $location.path('/home')
        } else {
          $scope.blogpost = data[0]
        }
      } else {
        console.error(err)
      }
    })

    $scope.submitPost = function() {
        var blogpost = {
          title: $scope.blogpost.title,
          content: $scope.blogpost.content
        }
        $http({
            url: '/api/post/'+$routeParams.id,
            method: 'PATCH',
            data: {blogpost: blogpost},
            headers: {'Content-Type': 'application/json'}
        }).then(function(res) {
          $location.path('/post/'+ $routeParams.id)
        }, function(err) {
          console.error(err.data)
        })
    }
  }
})();

(function() {
  angular.module('colonApp').controller('login', loginController)
  loginController.$inject = ['$scope', '$http', '$location']

  function loginController($scope, $http, $location) {
    if ($scope.$parent.blog.loggedin) {
      $location.path('/home')
    } else {
      $scope.login = function() {
        $http({
            url: '/api/login',
            method: 'POST',
            data: {code: $scope.gaCode},
            headers: {'Content-Type': 'application/json'}
        }).then(function(res) {
            $scope.$parent.blog.loggedin = true
            $location.path('/home')
        }, function(err) {
            console.error(err.data)
        })
      }
    }
  }
})();

(function() {
  angular.module('colonApp').controller('setup', setupController)
  setupController.$inject = ['$scope', '$http', '$sce']
  function setupController($scope, $http, $sce) {
    $http({
      url: '/api/setup/adminCode',
      method: 'GET'
    }).then(function(res) {
      $scope.message = 'Check the server console to get your setup code'
    }, function(err) {
      console.error(err.data)
      $scope.message = 'Error getting setup code.'
    })
    
    $scope.step = 1
    
    $scope.getQR = function() {
      $http({
        url: '/api/setup/QR',
        method: 'POST',
        data: {code: $scope.setupCode},
        headers: {'Content-Type': 'application/json'}
      }).then(function(res) {
        if (res.data.hasOwnProperty('qr')) {
          $scope.qr = $sce.trustAsHtml(res.data.qr)
          $scope.message = 'Scan the QR code with Google Authenticator and input the code to verify'
          $scope.adminCode = null
          $scope.step = 2
        }
      }, function(err) {
        if (err.data.verified) {
          $scope.message=`You're already verified. 
                          If you lost the code in Google Authenticator, 
                          delete the admin collection in the database to start again`
          $scope.step = 0
        } else {
          $scope.message = `Error getting QR code. 
                            Restart blog on the server and 
                            come back to this page to generate a new setup code`
        }
        console.error(err.data)
      })
    }
    
    $scope.verify = function() {
      $http({
        url: '/api/setup/verify',
        method: 'POST',
        data: {code: $scope.gaCode},
        headers: {'Content-Type': 'application/json'}
      }).then(function(res) {
        $scope.$parent.blog.loggedin = true
        $scope.qr = null
        $scope.message = null
        $scope.gaCode = null
        $scope.step = 3
      }, function(err) {
        $scope.message = `Error verifying code. 
                          Try again with the next one. 
                          If this still doesn't work, delete the admin collection in the database and start again`
        console.error(err.data)
      })
    }
  }
})();

(function() { 
  angular.module('colonApp').filter('niceDate', niceDataFilter)
  function niceDataFilter() {
    return function(d) {
      var options = {year: 'numeric', month: 'long', day: 'numeric'}
      var today  = new Date(d)
      return today.toLocaleDateString('en-GB',options)
    }
  }
})();

(function() {
  angular.module('colonApp').service('blogService', blogService)
  blogService.$inject = ['$http', '$q']

  function blogService($http, $q, $showdown) {

    return {
      get: getPost,
      delete: deletePost,
      edit: editPost,
      new: newPost
    }

    function getPost(id) {
      let post
      if (!id) {
        post = 'latest/5'
      } else {
        post = 'post/' + id
      }

      const options = {
        method: 'get',
        url: '/api/' + post,
        headers: {'Content-Type': 'application/json'}
      }

      return $http(options)
    }

    function deletePost(id) {
      if (!angular.isDefined(id)) {
        return $q.reject('Post ID required')
      }

      const options = {
        method: 'delete',
        url: '/api/post/' + id,
        headers: {'Content-Type': 'application/json'}
      }

      return $http(options)
    }

    function editPost(id, post) {
      if (!angular.isDefined(id)) {
        return $q.reject('Post ID required')
      } else if (!angular.isDefined(post)) {
        return $q.reject('Edited post required')
      }
      
      const options = {
        method: 'PATCH',
        url: '/api/post/' + id,
        data: {blogpost: post},
        headers: {'Content-Type': 'application/json'}
      }

      return $http(options)
    }

    function newPost() {
    }
  }
})();