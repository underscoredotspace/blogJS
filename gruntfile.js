module.exports = function(grunt) {
  grunt.initConfig({
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

  grunt.registerTask('min', ['uglify'])
  grunt.registerTask('default', []);
};