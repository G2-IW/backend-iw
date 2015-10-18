/*jslint node: true, indent: 2 */
'use strict';
module.exports = function (grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg     : grunt.file.readJSON('package.json'),
    jslint  : {
      all     : {
        src : ['package.json', 'Gruntfile.js', 'index.js', 'routes/**/*.js', 'common/**/*.js', 'tests/**/*.js'],
        directives : {
          indent : 2,
          node : true
        }
      }
    },
    jasmine_nodejs : {
      options : {
        specNameSuffix: 'spec.js'
      },
      all     : {
        specs : [
          "test/*.spec.js"
        ]
      }
    }

  });

  grunt.loadNpmTasks('grunt-jslint');
  grunt.loadNpmTasks('grunt-jasmine-nodejs');

  // Default task(s).
  grunt.registerTask('default', [
    'jslint',
    'jasmine_nodejs'
  ]);

};

