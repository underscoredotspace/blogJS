(function() {
  angular.module('colonApp', ['ngRoute', 'ngCookies', 'ng-showdown'])
})();

(function() {
  angular.module('colonApp')
    .constant('showdown', window.showdown)
    .constant('hljs', window.hljs)
})();

(function(){
    angular.module('colonApp').config(config)
    config.$inject = ['$routeProvider', '$showdownProvider', 'showdown', 'hljs']

    function config($routeProvider, $showdownProvider, showdown, hljs) {
      routerConfig($routeProvider)
      showdownConfig($showdownProvider, showdown, hljs)
    }

    function routerConfig($routeProvider) {
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
        controller: 'new',
        controllerAs: 'vm',
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

    function showdownConfig($showdownProvider, showdown, hljs) {
      showdown.extension('codehighlight', codeHighlight)
      $showdownProvider.loadExtension('codehighlight')

      function codeHighlight() {
        function htmlunencode (text) {
          return text.replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
        }
        
        function filterFunc (text, converter, options) {
          const [left, right] = ['<code\\b[^>]*>', '</code>']

          function replacement(wholeMatch, match, left, right) {
            match = htmlunencode(match)
            return `${left}${hljs.highlightAuto(match).value}${right}`
          }
          return showdown.helper.replaceRecursiveRegExp(text, replacement, left, right, 'g')
        }

        return [{type: 'output', filter: filterFunc}]
      }
    }
})();