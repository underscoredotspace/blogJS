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
    let id, page

    if (angular.isDefined($routeParams.id)) {
      const oIDRegEx = /[0-9a-fA-F]{24}/i
      if (!oIDRegEx.test($routeParams.id)) {
        $location.path('/home')
      } else {
        id = $routeParams.id
      }
    }

    if (angular.isDefined($routeParams.page)) {
      page = Number($routeParams.page)
    }
    
    vm.blogposts = []

    blogService.get({id, page})
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

      const oIDRegEx = /^[a-f\d]{24}$/i
      if (!oIDRegEx.test($routeParams.id)) {
        return $location.path('/home')
      } else {
        id = $routeParams.id
      }

      blogService.get({id})
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