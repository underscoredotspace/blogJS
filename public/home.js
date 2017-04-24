window.angular.module('colonApp', ['ngRoute', 'ngCookies', 'ng-showdown'])

.config(($showdownProvider, $routeProvider, $compileProvider) => {
  $compileProvider.debugInfoEnabled(false)
  $compileProvider.commentDirectivesEnabled(false)
  $compileProvider.cssClassDirectivesEnabled(false)
  
  window.showdown.extension('codehighlight', function() {
    const htmlunencode = (text) => text.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    return [
      {
        type: 'output',
        filter: function (text, converter, options) {
          // use new showdown's regexp engine to conditionally parse codeblocks
          var left  = '<code\\b[^>]*>',
              right = '</code>',
              flags = 'g',
              replacement = function (wholeMatch, match, left, right) {
                // unescape match to prevent double escaping
                match = htmlunencode(match)
                return left + window.hljs.highlightAuto(match).value + right
              }
          return window.showdown.helper.replaceRecursiveRegExp(text, replacement, left, right, flags)
        }
      }
    ]
  })
  
  $showdownProvider.loadExtension('codehighlight')

  $routeProvider
  .when('/about', {
    templateUrl: 'part/about.html',
    controller: 'about'
  })
  .when('/home', {
    templateUrl: 'part/home.html',
    controller: 'colonHome'
  })
  .when('/post/:id', {
    templateUrl: 'part/home.html',
    controller: 'colonPost'
  })
  .when('/new', {
    templateUrl: 'part/newpost.html',
    controller: 'colonNewPost'
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
    templateUrl: 'part/auth.html',
    controller: 'colonAuth'
  })
  .otherwise({redirectTo:'/home'})
})

.controller('about', function() {})

.controller('blog', function($scope, $cookies) {
  if($cookies.get('qqBlog')) {
    $scope.loggedin = true
  } else {
    $scope.loggedin = false
  }
})

.controller('logout', function($scope, $http, $location) {
  if (!$scope.$parent.loggedin) {
    $location.path('/home')
  } else {
    $http.get('/api/logout')
    .then(function(res) {
      $scope.$parent.loggedin = false
      $location.path('/home')
    }, function(res) {
      console.error(res)
      $scope.$parent.loggedin = false
      $location.path('/home')
    })
  }
})

.controller('colonHome', function($scope, storage) {
  storage.getFromLS('blog', function(err, data) {
    if (!err && data) {
      $scope.blogposts = data
      storage.getFromDB(null, function(err, data) {
        if (!err) {
          $scope.blogposts = data
        } else {
          console.error(err)
        }
      })
    } else {
      console.error(err)
      storage.getFromDB(null, function(err, data) {
        if (!err) {
          $scope.blogposts = data
        } else {
          console.error(err)
        }
      })
    }
  })
})

.controller('colonPost', function($scope, $routeParams, $location, storage) {
  storage.getFromDB($routeParams.id, function(err, data) {
    if (!err) {
      if (data.status==204) {
        console.info('Post doesn\'t exist')
       $location.path('/home')
      } else {
          $scope.blogposts = data
      }
    } else {
      console.error(err)
    }
  })
})

.controller('colonNewPost', function($scope, $http, $location) {
  if (!$scope.$parent.loggedin) {
    $location.path('/login')
  } else {
    $scope.blogpost = {
      title:  "",
      content:    "",
      date: new Date()
    }

    $scope.submitPost = function() {
      var blogpost = {
        title: $scope.blogpost.title,
        content: $scope.blogpost.content
      }
      $http({
          url: '/api/new',
          method: "POST",
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
})

.controller('login', function($scope, $http, $location) {
  if ($scope.$parent.loggedin) {
    $location.path('/home')
  } else {
    $scope.login = () => {
      $http({
          url: '/api/login',
          method: "POST",
          data: {code: $scope.gaCode},
          headers: {'Content-Type': 'application/json'}
      }).then(function(res) {
          $scope.$parent.loggedin = true
          $location.path('/home')
      }, function(err) {
          console.error(err.data)
      })
    }
  }
})

.controller('colonAuth', function($scope, $http, $sce) {
  $http({
    url: '/api/setup/adminCode',
    method: "GET"
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
      method: "POST",
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
        $scope.message='You\'re already verified. If you lost the code in Google Authenticator, delete the admin collection in the database to start again'
        $scope.step = 0
      } else {
        $scope.message = 'Error getting QR code. Restart blog on the server and come back to this page to generate a new setup code' 
      }
      console.error(err.data)
    })
  }
  
  $scope.verify = function() {
    $http({
      url: '/api/setup/verify',
      method: "POST",
      data: {code: $scope.gaCode},
      headers: {'Content-Type': 'application/json'}
    }).then(function(res) {
      $scope.qr = null
      $scope.message = null
      $scope.gaCode = null
      $scope.step = 3
    }, function(err) {
      $scope.message = 'Error verifying code. Try again with the next one. If this still doesn\'t work, delete the admin collection in the database and start again'
      console.error(err.data)
    })
  }
})
  
.filter('niceDate', function() {
  return function(d) {
    var options = {year: 'numeric', month: 'long', day: 'numeric'}
    var today  = new Date(d)
    return today.toLocaleDateString("en-GB",options)
  }
})

.filter('trustHTML', ['$sce', function ($sce) { 
  return function (text) {
    return $sce.trustAsHtml(text);
  };    
}])

.service('storage', function($http, $showdown) {
  return {
    saveToLS: function(key, data, cb) {
      if (!cb) cb = console.error
      try {
        window.localStorage.setItem(key, JSON.stringify(data))
        cb()
      } catch(err) {
        cb(err)
      }
    },
    getFromLS: function(key, cb) {
      try {
        const data = JSON.parse(window.localStorage.getItem(key))
        cb(null, data)
      } catch(err) {
        cb(err, null)
      }
    },
    getFromDB: function(postID, cb) {
      const self = this
      console.log('getting from database')
      let post
      if (!postID) {
        post = 'latest/5'
      } else {
        post = 'post/' + postID
      }
      // console.log(post)
      $http.get('/api/' + post)
      .then(function(res) {
          if (res.status==204) {
            console.warn('no posts yet!')
            const blogposts = [{
              title: 'Welcome',
              content: 'This is your blog. Make a <a href="/#!/new">post</a>. ',
              date: new Date()
            }]
            cb(null, blogposts)
          } else {
            self.convertMD(res.data, function(data) {
              if (data.length>1) {
                self.saveToLS('blog', data)
              }
              cb(null, data)
            })
          }
      }).catch(function(err) {
          cb(err)
      })
    },
    convertMD: function(posts, cb) {
      posts.forEach(function(post, ndx) {
        post.contentHTML = $showdown.makeHtml(post.content)
      })
      cb(posts)
    }
  }
})