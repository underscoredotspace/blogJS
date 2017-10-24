module.exports = function(grunt) {
  grunt.initConfig({
    uglify: {
      options: {
        sourceMap: true
      },
      blog: {
        files: {
          'app/client/build/app.min.js': ['app/client/src/*.js'],
          'app/client/build/lib.min.js': [
            'node_modules/angular/angular.min.js',
            'node_modules/angular-cookies/angular-cookies.min.js',
            'node_modules/angular-route/angular-route.min.js',
            'node_modules/angular-sanitize/angular-sanitize.min.js',
            'node_modules/showdown/dist/showdown.min.js',
            'node_modules/ng-showdown/dist/ng-showdown.min.js',
            'node_modules/highlightjs/highlight.pack.min.js'
            
          ]
        }
      }
    },
    watch: {
      view: {
        files: ['app/client/view/**/*.{html,css}'],
        options: {
          livereload: true
        }
      },
      minify: {
        files: ['app/client/src/*.js'],
        tasks: ['min'],
        options: {
          livereload: true
        }
      }
    }
  })

  grunt.loadNpmTasks('grunt-contrib-uglify')
  grunt.loadNpmTasks('grunt-contrib-watch')

  grunt.registerTask('min', ['uglify'])
  grunt.registerTask('default', ['watch']);
};