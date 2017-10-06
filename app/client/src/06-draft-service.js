(function() {
  angular.module('colonApp').service('drafts', draftService)
  draftService.$inject = ['$q']

  function draftService($q) {
    let enabled

    const self =  {
      load, 
      save, 
      init,
      list,
      enabled: () => enabled
    }

    return self

    function save(data) {
      if (!enabled) {
        return $q.reject('localStorage is not enabled')
      }

      let id
      if (data.hasOwnProperty('_id')) {
        id = data._id
      } else {
        id = _uuid()
      }
      localStorage.setItem(id, JSON.stringify(data))
      return $q.resolve(id)
    }

    function load(id) {
      if (!enabled) {
        return $q.reject('localStorage is not enabled')
      }
      const lsData = localStorage.getItem(id)
      const data = JSON.parse(lsData)
      return $q.resolve(data)
    }

    function list() {
      if (!enabled) {
        return $q.reject('localStorage is not enabled')
      }

      if (localStorage.length === 0) {
        return $q.resolve([])
      }

      const list = []
      for(let ndx = 0; ndx < localStorage.length; ndx++) {
        self.load(localStorage.key(ndx))
          .then(draft => list.push(draft))
          .catch(err => $q.reject('Error getting from localStorage'))
      }
      return $q.resolve(list)
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