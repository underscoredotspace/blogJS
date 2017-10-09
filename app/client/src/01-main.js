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
  angular.module('colonApp').controller('new', newController)
  newController.$inject = ['$location', 'authService', 'blogService', 'localDraft']

  function newController($location, authService, blogService, localDraft) {
    const vm = this

    if (!authService.isLoggedIn()) {
      return $location.path('/login')
    }

    vm.blogpost = {
      date: new Date()
    }

    localDraft.init().then(() => {
      vm.saveDraft = blogpost => {
        localDraft.save(blogpost)
          .then(id => $location.path('/draft/'+ id))
          .catch(console.error)
      }
    })

    
    vm.submitPost = blogpost => {
      blogService.new(blogpost)
        .then(id => $location.path('/post/'+ id))
        .catch(console.error)
    }
  }
})();

(function() {
  angular.module('colonApp').controller('draft', draftController)
  draftController.$inject = ['localDraft', 'blogService', 'authService', '$routeParams', '$location']

  function draftController(localDraft, blogService, authService, $routeParams, $location) {
    const vm = this
    console.log('hello')
    
    if (!authService.isLoggedIn()) {
      return $location.path('/login')
    }

    // const oIDRegEx = /^[a-f\d]{24}$/i
    // if (!oIDRegEx.test($routeParams.id)) {
    //   return $location.path('/home')
    // }
  
    const id = $routeParams.id

    localDraft.init().then(() => {
      vm.draftsEnabled = true

      localDraft.load(id)
        .then(draft => {
          console.log(draft)
          vm.blogpost = draft
        })
        .catch(console.error)

      vm.saveDraft = blogpost => {
        localDraft.save(blogpost)
          .then(id => $location.path('/draft/'+ id))
          .catch(console.error)
      }
    }).catch(console.error)
  }
})();

(function() {
  angular.module('colonApp').controller('edit', editController)
  editController.$inject = ['blogService', 'authService', 'localDraft', '$routeParams', '$location']

  function editController(blogService, authService, localDraft, $routeParams, $location) {
    const vm = this

    if (!authService.isLoggedIn()) {
      return $location.path('/login')
    }

    const oIDRegEx = /^[a-f\d]{24}$/i
    if (!oIDRegEx.test($routeParams.id)) {
      return $location.path('/home')
    }
  
    const id = $routeParams.id

    localDraft.init().then(() => {
      vm.draftsEnabled = true

      vm.saveDraft = blogpost => {
        localDraft.save(blogpost)
          .then(id => $location.path('/draft/'+ id))
          .catch(console.error)
      }
    }).catch(console.error)

    blogService.get({id})
      .then(blog => {
        vm.blogpost = blog.posts[0]
      })
      .catch(console.error)

    vm.submitPost = blogpost => {
      blogService.edit(id, blogpost)
        .then(id => $location.path('/post/'+ id))
        .catch(console.error)
    }
  }
})();

(function() {
  angular.module('colonApp').controller('login', loginController)
  loginController.$inject = ['$location', 'authService', '$rootScope']

  function loginController($location, authService, $rootScope) {
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