(function() {
  angular.module('colonApp', ['ngRoute', 'ngCookies'])
})();

(function(){
    angular.module('colonApp').config(config)
    config.$inject = ['$routeProvider']

    function config($routeProvider) {
      $routeProvider
      .when('/about', {
        templateUrl: 'part/about.html'
      })
      .when('/home', {
        templateUrl: 'part/posts.html',
        controller: 'post',
        controllerAs: 'vm',
      })
      .when('/home/:page', {
        templateUrl: 'part/posts.html',
        controller: 'post',
        controllerAs: 'vm',
      })
      .when('/post/:id', {
        templateUrl: 'part/posts.html',
        controller: 'post',
        controllerAs: 'vm',
      })
      .when('/new', {
        templateUrl: 'part/newpost.html',
        controller: 'edit',
        controllerAs: 'vm',
      })
      .when('/new/:id', {
        templateUrl: 'part/newpost.html',
        controller: 'edit',
        controllerAs: 'vm'
      })
      .when('/edit/:id', {
        templateUrl: 'part/newpost.html',
        controller: 'edit',
        controllerAs: 'vm'
      })
      .when('/login', {
        templateUrl: 'part/login.html',
        controller: 'login',
        controllerAs: 'vm'
      })
      .when('/logout', {
        template: '',
        controller: 'logout'
      })
      .when('/setup/', {
        templateUrl: 'part/setup.html',
        controller: 'setup',
        controllerAs: 'vm'
      })
      .otherwise({redirectTo:'/home'})
    }
})();