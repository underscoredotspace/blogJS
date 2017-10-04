(function() {
  angular.module('colonApp').service('drafts', draftService)
  draftService.$inject = ['$q']

  function draftService($q) {
    let enabled

    return {
      load, 
      save, 
      init,
      enabled: () => enabled
    }

    function save(data) {
      if (!enabled) {
        return $q.reject('localStorage is not enabled')
      }
      localStorage.setItem('Draft', JSON.stringify(data))
      return $q.resolve(true)
    }

    function load() {
      if (!enabled) {
        return $q.reject('localStorage is not enabled')
      }
      const lsData = localStorage.getItem('Draft')
      const data = JSON.parse(lsData)
      return $q.resolve(data)
    }

    function init() {
      try {
        localStorage.setItem('test', 'test')
        localStorage.removeItem('test')
        enabled = true
        console.log('Drafts Service is enabled')
        return $q.resolve(true)
      } catch(err) {
        console.log('Drafts Service is disabled')
        return $q.reject({localStorage:err})
      }
    }
  }
})()