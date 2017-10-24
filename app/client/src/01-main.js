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

    blogService.get({id, page})
      .then(blog => {
        vm.blogposts = blog.posts

        if (!id) {
          if (!page) {page = '1'}
          if (blog.more) {vm.next = Number(page) + 1}
          if (Number(page) > 1) {vm.prev = Number(page) - 1}
        }
      })
      .catch(err => console.error)

    vm.postDelete = id => {
      // TODO: request confirmation
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
  angular.module('colonApp').controller('edit', editController)
  editController.$inject = ['localDraft', 'blogService', 'authService', '$routeParams', '$location']

  function editController(localDraft, blogService, authService, $routeParams, $location) {
    const vm = this
    
    if (!authService.isLoggedIn()) {
      return $location.path('/login')
    }

    localDraft.init().then(()=>{vm.lsEnabled=true})
    
    vm.lsSave = (blogpost, newpost) => {
      if (!vm.lsEnabled) {return}

      if (!newpost.$valid) {
        vm.saved = false
        return
      }

      localDraft.save(blogpost)
        .then(id => {
          if (angular.isUndefined(blogpost._id)) {
            blogpost._id = id
          }
          console.log('saved')
          vm.saved = true
        })
        .catch(err => {
          console.error(err)
          vm.saved = false
        })
    }

    if ($routeParams.id) {
      vm.submitPost = blogpost => {
        blogService.edit($routeParams.id, blogpost)
          .then(id => {
            // return localDraft.remove($routeParams.id).then(() => {
              $location.path('/post/'+ id)
            // })
          })
          .catch(console.error)
      }

      const oIDRegEx = /^[a-f\d]{24}$/i
      if (oIDRegEx.test($routeParams.id)) {
        localDraft.load($routeParams.id)
        .then(draft => {
          if (!draft) {
            blogService.get({id:$routeParams.id})
            .then(blog => {
              vm.blogpost = blog.posts[0]
              vm.saved = true
            })
            .catch(console.error)
          }
          vm.blogpost = draft
          vm.saved = true
        })
        .catch(console.error)
        
      } else {
        localDraft.load($routeParams.id)
          .then(draft => {
            if (!draft) {
              console.error('Invalid draft ID')
              return $location.path('/home')
            }
            vm.blogpost = draft
            vm.saved = true
          })
          .catch(console.error)
      }
    } else {
      vm.submitPost = blogpost => {
        blogService.new(blogpost)
          .then(id => {
            return localDraft.remove($routeParams.id).then(() => {
              $location.path('/post/'+ id)
            })
          })
          .catch(console.error)
      }
    }
  }
})();

(function() {
  angular.module('colonApp').controller('login', loginController)
  loginController.$inject = ['$location', 'authService', '$rootScope', 'localDraft']

  function loginController($location, authService, $rootScope, localDraft) {
    const vm = this
    $rootScope.$broadcast('auth-status')

    if (authService.isLoggedIn()) {
      return $location.path('/home')
    }

    vm.login = function(code) {
      authService.login(code)
        .then(() => {$location.path('/home')})
        .catch(console.error)      
    }
  }
})();