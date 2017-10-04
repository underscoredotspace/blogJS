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
      const uuid = _uuid()
      localStorage.setItem(uuid, JSON.stringify(data))
      return $q.resolve(uuid)
    }

    function load(uuid) {
      if (!enabled) {
        return $q.reject('localStorage is not enabled')
      }
      const lsData = localStorage.getItem(uuid)
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

    function _uuid() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        let d = new Date().getTime(),
            r = (d + Math.random()*16)%16 | 0
        d = Math.floor(d/16)
        return (c=='x' ? r : (r&0x3|0x8)).toString(16)
      })
    }
  }
})()