module.exports = function(grunt) {
  grunt.initConfig({
    uglify: {
      build: {
        src: 'app/client/home.js',
        dest: 'app/client/home.min.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('min', ['uglify'])
  grunt.registerTask('default', []);
};