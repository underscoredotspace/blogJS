(function() {
  angular.module('colonApp').controller('setup', setupController)
  setupController.$inject = ['setupService', '$routeParams', '$location', '$sce']

  function setupController(setupService, $routeParams, $location, $sce) {
    const vm = this
    vm.step = '1'

    vm.getQR = function(setupCode) {
      setupService.getQR(setupCode)
        .then(qr => {
          vm.qr = $sce.trustAsHtml(qr)
          vm.step = '2'
        })
        .catch(err => {
          console.log(err)
        })
    }

    vm.verify = function(gaCode) {
      setupService.verify(gaCode)
      .then(() => {
        vm.qr = undefined
        vm.step = '3'
      })
      .catch(err => {
        console.log(err)
      })
    }
  }
})();

(function() {
  angular.module('colonApp').service('setupService', setupService)
  setupService.$inject = ['$http', '$q']

  function setupService($http, $q) {
    const setupPath = '/api/setup'
    return {
      getQR, 
      verify
    }

    function getQR(code) {
      const options = {
        url: `${setupPath}/qr`,
        method: 'POST',
        data: {code},
        headers: {'Content-Type': 'application/json'}
      }
      return $http(options)
        .then(res => {
          if (angular.isDefined(res.data.qr)) {
            return $q.resolve(res.data.qr)
          } else {
            return $q.reject(0)
          }
        })
    }

    function verify(code) {
      const options = {
        url: `${setupPath}/verify`,
        method: 'POST',
        data: {code},
        headers: {'Content-Type': 'application/json'}
      }
      return $http(options)
    }
  }
})();