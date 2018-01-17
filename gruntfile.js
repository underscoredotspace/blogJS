module.exports = function(grunt) {
  grunt.initConfig({
    uglify: {
      options: {
        sourceMap: true
      },
      blog: {
        files: {
          'app/client/build/app.min.js': ['app/client/src/ngApp/*.js'],
          'app/client/build/md2html-Worker.min.js': ['app/client/src/md2html-Worker.js']
        }
      },
      lib: {
        files: {
          'app/client/build/lib.min.js': [
            'node_modules/angular/angular.min.js',
            'node_modules/angular-cookies/angular-cookies.min.js',
            'node_modules/angular-route/angular-route.min.js',
            'node_modules/angular-sanitize/angular-sanitize.min.js'
          ],
          'app/client/build/lib-showdown.min.js': [
            'node_modules/showdown/dist/showdown.min.js',
            'node_modules/highlightjs/highlight.pack.min.js'
          ]
        }
      }
    },
    cssmin: {
      blog: {
        files: {
          'app/client/build/style.min.css': ['app/client/view/*.css']
        }
      }
    },
    watch: {
      html: {
        files: ['app/client/view/**/*.html'],
        options: {
          livereload: true
        }
      },
      css: {
        files: ['app/client/view/**/*.css'],
        tasks: ['cssmin'],
        options: {
          livereload: true
        }
      },
      minify: {
        files: ['app/client/src/**/*.js'],
        tasks: ['min'],
        options: {
          livereload: true
        }
      }
    }
  })

  grunt.loadNpmTasks('grunt-contrib-uglify-es')
  grunt.loadNpmTasks('grunt-contrib-cssmin')
  grunt.loadNpmTasks('grunt-contrib-watch')

  grunt.registerTask('min', ['uglify:blog', 'cssmin'])
  grunt.registerTask('lib', ['uglify:lib'])
  grunt.registerTask('css', ['cssmin'])
  grunt.registerTask('default', ['watch'])
};