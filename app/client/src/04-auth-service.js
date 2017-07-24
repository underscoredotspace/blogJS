angular.module('colonApp').service('authService', authService)

authService.$inject = ['$http', '$cookies', '$q', '$rootScope']
function authService($http, $cookies, $q, $rootScope) {
  return {
    login,
    logout,
    isLoggedIn
  }

  function login(code) {
    const options = {
      url: '/api/login',
      method: 'POST',
      data: {code},
      headers: {'Content-Type': 'application/json'}
    }
    return $http(options)
    .then(res => {
      if (res.data.loggedin === true) {
        $rootScope.$broadcast('auth-status')
        return $q.resolve(res)
      } else {
        return $q.reject(res)
      }
    })
  }

  function logout() {
    $cookies.remove('qqBlog')
    return $http.get('/api/logout')
    .then(res => {
      $rootScope.$broadcast('auth-status')
      return $q.resolve(res)
    })
  }

  function isLoggedIn() {
    if ($cookies.get('qqBlog')) {
      return true
    } else {
      return false
    }
  }
}