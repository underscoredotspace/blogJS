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
      minify: {
        files: ['app/client/src/*.js'],
        tasks: ['min']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('min', ['uglify'])
  grunt.registerTask('default', ['min', 'watch']);
};