(function() {
  angular.module('colonApp').controller('setup', setupController)
  setupController.$inject = ['$scope', '$http', '$sce']
  function setupController($scope, $http, $sce) {
    $http({
      url: '/api/setup/adminCode',
      method: 'GET'
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
        method: 'POST',
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
          $scope.message=`You're already verified. 
                          If you lost the code in Google Authenticator, 
                          delete the admin collection in the database to start again`
          $scope.step = 0
        } else {
          $scope.message = `Error getting QR code. 
                            Restart blog on the server and 
                            come back to this page to generate a new setup code`
        }
        console.error(err.data)
      })
    }
    
    $scope.verify = function() {
      $http({
        url: '/api/setup/verify',
        method: 'POST',
        data: {code: $scope.gaCode},
        headers: {'Content-Type': 'application/json'}
      }).then(function(res) {
        $scope.$parent.blog.loggedin = true
        $scope.qr = null
        $scope.message = null
        $scope.gaCode = null
        $scope.step = 3
      }, function(err) {
        $scope.message = `Error verifying code. 
                          Try again with the next one. 
                          If this still doesn't work, delete the admin collection in the database and start again`
        console.error(err.data)
      })
    }
  }
})();