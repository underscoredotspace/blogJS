angular.module('colonApp').service('authService', authService)

authService.$inject = ['$http', '$cookies', '$q', '$rootScope', '$location']
function authService($http, $cookies, $q, $rootScope, $location) {
  const authPath = '/api/user'

  return {
    login,
    logout,
    isLoggedIn
  }

  function login(code) {
    const options = {
      url: `${authPath}/login`,
      method: 'POST',
      data: {code},
      headers: {'Content-Type': 'application/json'}
    }
    return $http(options)
    .then(res => {
        $rootScope.$broadcast('auth-status')
        return $q.resolve(res)
    })
  }

  function logout() {
    $cookies.remove('qqBlog')
    return $http.get(`${authPath}/logout`)
    .then(res => {
      $rootScope.$broadcast('auth-status')
      return $q.resolve(res)
    })
  }
    
  function isLoggedIn() {
    return angular.isDefined($cookies.get('qqBlog'))
  }
}