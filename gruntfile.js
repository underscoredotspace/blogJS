module.exports = function(grunt) {
  grunt.initConfig({
    uglify: {
      options: {
        mangle: {
          except: []
        }
      },
      build: {
        src: 'client/home.js',
        dest: 'client/home.min.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('min', ['uglify'])
  grunt.registerTask('default', []);
};