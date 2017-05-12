module.exports = function(grunt) {
  grunt.initConfig({
    jasmine : {
      src : 'public/*.min.js',
      options : {
        specs : './tests/*.spec.js',
        vendor: [
          'https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.6.4/angular.min.js',
          'https://code.angularjs.org/1.6.4/angular-mocks.js'
        ]
      }
    },
    uglify: {
      options: {
        mangle: {
          except: []
        }
      },
      build: {
        src: 'public/home.js',
        dest: 'public/home.min.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jasmine');

  grunt.registerTask('test', ['jasmine'])
  grunt.registerTask('min', ['uglify'])
  grunt.registerTask('default', ['min', 'test']);
};