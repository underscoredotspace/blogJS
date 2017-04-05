window.angular.module('colonApp', ['ngRoute'])

.config(function($routeProvider) {
    $routeProvider
    .when('/', {
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
    .otherwise({redirectTo:'/'});
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
    $http.get('/blog/' + $routeParams.id + '/1')
    .then(function(res) {
        $scope.blogposts = res.data
    }, function(res) {
        console.log(res);
    });
})

.controller('colonNewPost', function($scope, $http, $filter, niceDate) {
  console.log('new post')
  var d = new Date()
  $scope.blogpost = {
    title:  "Post Title is Nice",
    author:   "ampersand",
    category:   "meta",
    content:    "",
    on: niceDate(d)
  }
  
  $scope.submitPost = function() {
    var newPost = {
        title:  $scope.blogpost.title,
        content:    $filter('createHTMLParas')($scope.blogpost.content, false),
        code:    $scope.otpcode
    };
    console.log(newPost.content)
    $http({
        url: '/api/new',
        method: "POST",
        data: {blogpost: newPost},
        headers: {'Content-Type': 'application/json'}
    }).then(function(res) {
          console.log(res)
    }, function(err) {
        console.log(err.data)
    });
  }
})

.filter('createHTMLParas', ($sce) => {
  return function(content, trust) {
    var output = ''
    var paras = content.replace('\n\n', '\n').split('\n')
    paras.forEach((para, ndx) => {
      if (para.trim().length!=0) {
        if (ndx != paras.length - 1) {
          para += '</p><p>'
        }
        output += para
      }
    })

    if (trust) {
      return $sce.trustAsHtml('<p>' + output + '</p>')
    } else {
      return '<p>' + output + '</p>'
    }
  }
})
  
.service('niceDate', function() {
  return function(d) {
      var options = {year: 'numeric', month: 'long', day: 'numeric'}
      var today  = new Date(d)
      return today.toLocaleDateString("en-GB",options)
    }
})