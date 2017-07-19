(function(){
  angular.module('colonApp').controller('blogController', blogController)
  blogController.$inject = ['$rootScope', 'authService']

  function blogController($rootScope, authService) {
    const vm = this
    vm.loggedin = authService.isLoggedIn()

    $rootScope.$on('auth-status', () => {
      vm.loggedin = authService.isLoggedIn()
    })
  }
})();

(function() {
  angular.module('colonApp').controller('logout', logoutController)
  logoutController.$inject = ['$location', 'authService']

  function logoutController($location, authService) {
    if (authService.isLoggedIn()) {
      authService.logout().catch(console.error)      
    }
    $location.path('/home')
  }
})();

(function() {
  angular.module('colonApp').controller('post', postController)
  postController.$inject = ['$routeParams', '$location', '$filter', 'blogService']

  function postController($routeParams, $location, $filter, blogService) {
    const vm = this
    let id

    if (angular.isDefined($routeParams.id)) {
      const oIDRegEx = /[0-9a-fA-F]{24}/i
      if (!oIDRegEx.test($routeParams.id)) {
        $location.path('/home')
      } else {
        id = $routeParams.id
      }
    }
    
    vm.blogposts = []

    blogService.get(id)
      .then(posts => {

        for (let post of posts.data) {
          vm.blogposts.push(post)
        }
      })
      .catch(err => console.error)

    vm.postDelete = id => {
      blogService.delete(id)
        .then(() => {
          vm.blogposts = $filter('filter')(vm.blogposts, {'_id': '!' + id})
          $location.path('/home')
        })
        .catch(console.error)
    }

    vm.postEdit = id => {
      $location.path(`/edit/${id}`)
    }
  }
})();

(function() {
  angular.module('colonApp').controller('new', newController)
  newController.$inject = ['$location', 'authService', 'blogService']

  function newController($location, authService, blogService) {
    const vm = this

    if (!authService.isLoggedIn()) {
      $location.path('/login')
    } else {
      vm.blogpost = {
        date: new Date()
      }
      
      vm.submitPost = blogpost => {
        blogService.new(blogpost)
        .then(id => {
          $location.path('/post/'+ id)
        })
        .catch(console.error)
      }
    }
  }
})();

(function() {
  angular.module('colonApp').controller('edit', editController)
  editController.$inject = ['blogService', 'authService', '$routeParams', '$location']

  function editController(blogService, authService, $routeParams, $location) {
    const vm = this

    if (!authService.isLoggedIn()) {
      $location.path('/login')
    } else {
      let id

      if (angular.isDefined($routeParams.id)) {
        const oIDRegEx = /^[a-f\d]{24}$/i
        if (!oIDRegEx.test($routeParams.id)) {
          return $location.path('/home')
        } else {
          id = $routeParams.id
        }
      }

      blogService.get(id)
        .then(posts => {
          vm.blogpost = posts.data[0]
        })
        .catch(console.error)


      vm.submitPost = blogpost => {
        blogService.edit(id, blogpost)
          .then(id => {
            $location.path('/post/'+ id)
          })
          .catch(console.error)
      }
    }
  }
})();

(function() {
  angular.module('colonApp').controller('login', loginController)
  loginController.$inject = ['$location', 'authService']

  function loginController($location, authService) {
    const vm = this
    if (authService.isLoggedIn()) {
      $location.path('/home')
    } else {
      vm.login = function(code) {
        authService.login(code)
          .then(() => {$location.path('/home')})
          .catch(console.error)      
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