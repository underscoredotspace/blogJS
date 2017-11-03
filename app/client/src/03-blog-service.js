// blogService.js

(function() {
  angular.module('colonApp').service('blogService', blogService)
  blogService.$inject = ['$http', '$q', 'md2html']

  function blogService($http, $q, md2html) {
    let blogPath = '/api/blog'

    return {
      get: getPost,
      delete: deletePost,
      edit: editPost,
      new: newPost
    }

    function getPost({id, page} = {}) {
      let post = blogPath
      if (page) {
        post += `/${page}`
      } else if (id) {
        post += `/id/${id}`
      }

      const options = {
        method: 'get',
        url: post,
        headers: {'Content-Type': 'application/json'}
      }
      return $http(options)
        .then(res => {
          res.data.posts.forEach(post => {
            md2html(post._id, post.content).then(content => {
              post.contentHtml = content
            })
          })
          return res.data
        })
    }

    function deletePost(id) {
      if (!angular.isDefined(id)) {
        return $q.reject('Post ID required')
      }

      const options = {
        method: 'delete',
        url: `${blogPath}/${id}`,
        headers: {'Content-Type': 'application/json'}
      }

      return $http(options)
    }

    function editPost(id, blogpost) {
      if (!angular.isDefined(id)) {
        return $q.reject('Post ID required')
      } else if (!angular.isDefined(blogpost)) {
        return $q.reject('Edited post required')
      } else if (blogpost.title.length < 5 || blogpost.content.length < 5) {
        return $q.reject('Title or content too short')
      }
      
      const options = {
        method: 'PATCH',
        url: `${blogPath}/${id}`,
        data: {blogpost},
        headers: {'Content-Type': 'application/json'}
      }

      return $http(options)
        .then(res => $q.resolve(id))
    }

    function newPost(blogpost) {
      if (!angular.isDefined(blogpost)) {
        return $q.reject('New post required')
      } else if (blogpost.title.length < 5 || blogpost.content.length < 5) {
        return $q.reject('Title or content too short')
      }

      const options = {
        method: 'POST',
        url: blogPath,
        data: {blogpost},
        headers: {'Content-Type': 'application/json'}
      }

      return $http(options)
        .then(res => $q.resolve(res.data.id))
    }
  }
})();

(function(){
  angular.module('colonApp').service('md2html', md2html)

  md2html.$inject = ['$q', '$sce']

  function md2html($q, $sce) {
    const showdownWorker = new Worker('sdWorker.js')

    return (id, md) => {
      return $q((resolve, reject) => {
        showdownWorker.postMessage({id, md})
        const timeout = setTimeout(() => reject('timeout'), 2000)
        showdownWorker.addEventListener('message', (d) => {
          if (d.data.id === id) { 
            clearTimeout(timeout)
            const html = $sce.trustAsHtml(d.data.html)
            resolve(html)
          }
        })
      })
    }
  }
})();