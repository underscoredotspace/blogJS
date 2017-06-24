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

    function getPost(id) {
      let post
      if (!id) {
        post = 'latest/5'
      } else {
        post = 'post/' + id
      }

      const options = {
        method: 'get',
        url: '/api/' + post,
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

    function editPost(id, post) {
      if (!angular.isDefined(id)) {
        return $q.reject('Post ID required')
      } else if (!angular.isDefined(post)) {
        return $q.reject('Edited post required')
      } else if (post.title.length < 5 || post.content.length < 5) {
        return $q.reject('Title or content too short')
      }
      
      const options = {
        method: 'PATCH',
        url: '/api/post/' + id,
        data: {blogpost: post},
        headers: {'Content-Type': 'application/json'}
      }

      return $http(options)
    }

    function newPost() {
    }
  }
})();