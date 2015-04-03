'use strict';

module.exports = function (grunt) {

  require('load-grunt-tasks')(grunt);
  require('time-grunt')(grunt);

  grunt.initConfig({

    settings: {
    },

    env : {
      options : {
      },
      test : {
        NODE_ENV : 'test'
      }
    },

    cafemocha: {
      options: {
        reporter: (process.env.MOCHA_REPORTER || 'spec'),
        timeout: 20000,
        colors: true,
        debug: true
      },
      all: {
        src: ['tests/*.js', '!node_modules/**/*.js']
      }
    },

  });

  grunt.registerTask('test', 'Run Tests', function () {
    grunt.task.run(['env:test', 'cafemocha:all']);
  });

  grunt.registerTask('default', ['test']);

};

