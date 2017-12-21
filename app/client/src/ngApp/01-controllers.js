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

    init()

    function init() {
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
    }
      
    vm.postDelete = id => {
      // TODO: request confirmation
      blogService.delete(id)
        .then(() => {
          vm.blogposts = $filter('filter')(vm.blogposts, {'_id': '!' + id})
          $location.path('/home')
          init()
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
  editController.$inject = [
    'localDraft', 'blogService', 'authService', 'md2html' , '$routeParams', '$location', '$scope'
  ]

  function editController(localDraft, blogService, authService, md2html, $routeParams, $location, $scope) {
    const vm = this
    
    if (!authService.isLoggedIn()) {
      return $location.path('/login')
    }

    $scope.$watch('vm.blogpost.content', contentMd => {
      md2html('new', contentMd).then(html => {vm.contentHtml = html})
    })

    localDraft.init().then(()=>{vm.lsEnabled=true})
    
    vm.lsSave = (blogpost, newpost) => {
      if (!vm.lsEnabled) {return}

      if (!newpost.$valid) {
        vm.saved = false
        return
      }

      localDraft.save(blogpost)
        .then(id => {
          blogpost._id = id
          console.log(`Draft ${id} saved`)
          vm.saved = true
        })
        .catch(err => {
          console.error(err)
          vm.saved = false
        })
    }

    if ($routeParams.id) {  //-> /edit/:id
      const postID = $routeParams.id

      // Set up submitPost func for edit route
      vm.submitPost = blogpost => {
        blogService.edit(postID, blogpost).then(id => {
          localDraft.remove(postID).catch(console.error)
          $location.path('/post/'+ id)
        }).catch(console.error)
      }

      // Attempt to load draft from LS
      localDraft.load($routeParams.id).then(draft => {
        if (!draft) {
          // No draft found, so load from DB
          blogService.get({id:$routeParams.id}).then(blog => {
            vm.blogpost = blog.posts[0]
            vm.saved = true
          }).catch(console.error)
        }
        vm.blogpost = draft
        vm.saved = true
      }).catch(console.error)
    } else {  //-> /new
      // Set up submitPost func for edit route
      vm.submitPost = blogpost => {
        const draftID = blogpost._id
        blogService.new(blogpost).then(id => {
          localDraft.remove(draftID).catch(console.error)
          $location.path('/post/'+ id)
        }).catch(console.error)
      }
      // get list of drafts from localStorage
      localDraft.list().then(drafts => {
        vm.drafts = drafts.filter(draft => draft._id.substr(0,2) === 'd-')
        
        vm.loadDraft = id => {
          localDraft.load(id).then(draft => {
            vm.blogpost = draft
            vm.saved = true
          }).catch(console.error)
        }
      }).catch(console.error)
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