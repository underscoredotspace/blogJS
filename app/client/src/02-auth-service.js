angular.module('colonApp').service('authService', authService)

authService.$inject = ['$http', '$cookies', '$q', '$rootScope']
function authService($http, $cookies, $q, $rootScope) {
  let loggedIn = false

  if ($cookies.get('qqBlog')) {
    loggedIn = true
  }

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
        loggedIn = true
        $rootScope.$broadcast('auth-status')
        return $q.resolve(res)
      } else {
        return $q.reject(res)
      }
    })
  }

  function logout() {
    return $http.get('/api/logout')
    .then(res => {
      loggedIn = false
      $rootScope.$broadcast('auth-status', loggedIn)
      return $q.resolve(res)
    })
  }

  function isLoggedIn() {
    return loggedIn
  }
}