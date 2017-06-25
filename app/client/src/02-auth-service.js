angular.module('colonApp').service('authService', authService)

authService.$inject = ['$http', '$cookies', '$q']
function authService($http, $cookies, $q) {
  let loggedIn = false

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
      return $q.resolve(res)
    })
  }

  function isLoggedIn() {
    return loggedIn
  }
}