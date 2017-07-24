// blogService.js

(function() {
  angular.module('colonApp').service('blogService', blogService)
  blogService.$inject = ['$http', '$q']

  function blogService($http, $q, $showdown) {

    return {
      get: getPost,
      delete: deletePost,
      edit: editPost,
      new: newPost
    }

    function getPost({id, page} = {}) {
      let post = '/api/blog/'
      if (page) {
        post += page
      } else if (id) {
        post += `id/${id}`
      }

      const options = {
        method: 'get',
        url: post,
        headers: {'Content-Type': 'application/json'}
      }

      return $http(options)
    }

    function deletePost(id) {
      if (!angular.isDefined(id)) {
        return $q.reject('Post ID required')
      }

      const options = {
        method: 'delete',
        url: '/api/post/' + id,
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
        url: '/api/post/' + id,
        data: {blogpost},
        headers: {'Content-Type': 'application/json'}
      }

      return $http(options)
        .then(res => $q.resolve(res.data.id))
    }

    function newPost(blogpost) {
      if (!angular.isDefined(blogpost)) {
        return $q.reject('New post required')
      } else if (blogpost.title.length < 5 || blogpost.content.length < 5) {
        return $q.reject('Title or content too short')
      }

      const options = {
        method: 'POST',
        url: '/api/post',
        data: {blogpost},
        headers: {'Content-Type': 'application/json'}
      }

      return $http(options)
        .then(res => $q.resolve(res.data.id))
    }
  }
})();