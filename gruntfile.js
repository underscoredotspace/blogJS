module.exports = function(grunt) {
  grunt.initConfig({
    uglify: {
      build: {
        src: 'app/client/home.js',
        dest: 'app/client/home.min.js'
      }
    },
    watch: {
      minify: {
        files: ['app/client/**/*.js', '!app/client/**/*.min.js'],
        tasks: ['min']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('min', ['uglify'])
  grunt.registerTask('default', ['watch']);
};