(function() {
  angular.module('colonApp').service('localDraft', localDraft)
  localDraft.$inject = ['$q']

  function localDraft($q) {
    let enabled

    const self =  {
      load, 
      save, 
      init,
      list,
      remove,
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
        id = _nuuid()
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
        const key = localStorage.key(ndx)
        self.load(key)
          .then(draft => list.push(draft))
          .catch($q.reject)
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

    function remove(id) {
      if (!localStorage.getItem(id)) {
        return $q.reject({localStorage:`${id} doesn't exist`})
      }
      
      localStorage.removeItem(id)
      if (!localStorage.getItem(id)) {
        return $q.resolve(`${id} deleted`)
      }

      return $q.reject({localStorage:`Failed to delete ${id}`})
    }

    function _nuuid() {
      return 'd-xxxxxxxxxxxxxxxxxxxxxxxx'.replace(/x/g, () => {
        let d = new Date().getTime()
        d = d * Math.random()
        d = Math.floor(d) % 16
        return d.toString(16)
      })
    }
  }
})()