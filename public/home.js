window.angular.module('colonApp', ['ngRoute', 'ng-showdown'])

.config(($showdownProvider, $routeProvider) => {
  window.showdown.extension('codehighlight', function() {
    function htmlunencode(text) {
      return (
        text
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
        );
    }
    return [
      {
        type: 'output',
        filter: function (text, converter, options) {
          // use new shodown's regexp engine to conditionally parse codeblocks
          var left  = '<code\\b[^>]*>',
              right = '</code>',
              flags = 'g',
              replacement = function (wholeMatch, match, left, right) {
                // unescape match to prevent double escaping
                match = htmlunencode(match);
                return left + window.hljs.highlightAuto(match).value + right;
              };
          return window.showdown.helper.replaceRecursiveRegExp(text, replacement, left, right, flags);
        }
      }
    ];
  });
  $showdownProvider.loadExtension('codehighlight')

  $routeProvider
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
  .when('/setup/', {
        templateUrl: 'part/auth.html',
        controller: 'colonAuth'
    })
    .otherwise({redirectTo:'/home'});
})

.controller('colonHome', function($scope, $http){
    $http.get('/api/latest/5')
    .then(function(res) {
        if (res.status==204) {
            console.log('no posts yet!')
        } else {
            $scope.blogposts = res.data
        }
    }, function(res) {
        console.log(res);
    });
})
.controller('colonPost', function($scope, $routeParams, $http){
  $http.get('/api/post/' + $routeParams.id)
  .then(function(res) {
     if (res.status==204) {
          console.log('no posts yet!')
      } else {
          $scope.blogposts = res.data
      }
  }, function(res) {
      console.log(res);
  });
})

.controller('colonNewPost', function($scope, $http, $filter) {
  console.log('new post')
  $scope.blogpost = {
    title:  "",
    content:    ""
  }
  
  $scope.submitPost = function() {
    var blogpost = {
      title: $scope.blogpost.title,
      content: $scope.blogpost.content
    }
    $http({
        url: '/api/new',
        method: "POST",
        data: {blogpost: blogpost, code: $scope.otpcode},
        headers: {'Content-Type': 'application/json'}
    }).then(function(res) {
        console.log(res.data)
    }, function(err) {
        console.log(err.data)
    });
  }
})

.controller('colonAuth', function($scope, $http, $sce) {
  $http({
    url: '/api/adminCode',
    method: "GET"
  }).then(function(res) {
    console.log(res.data)
    $scope.message = 'Check the server console to get your setup code'
  }, function(err) {
    console.log(err.data)
    $scope.message = 'Error getting setup code.'
  });
  
  $scope.step = 1
  
  $scope.getQR = function() {
    $http({
      url: '/api/QR',
      method: "POST",
      data: {code: $scope.setupCode},
      headers: {'Content-Type': 'application/json'}
    }).then(function(res) {
      console.log(res.data)
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
      console.log(err.data)
    });
  }
  
  $scope.verify = function() {
    $http({
      url: '/api/verify',
      method: "POST",
      data: {code: $scope.gaCode},
      headers: {'Content-Type': 'application/json'}
    }).then(function(res) {
      console.log(res.data)
      $scope.qr = null
      $scope.message = null
      $scope.gaCode = null
      $scope.step = 3
    }, function(err) {
      $scope.message = 'Error verifying code. Try again with the next one. If this still doesn\'t work, delete the admin collection in the database and start again'
      console.log(err.data)
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