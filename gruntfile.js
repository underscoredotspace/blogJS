module.exports = function(grunt) {
  grunt.initConfig({
    uglify: {
      options: {
        sourceMap: true
      },
      blog: {
        files: {
          'app/client/build/app.min.js': ['app/client/src/*.js']
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
  grunt.registerTask('default', ['min', 'watch']);
};