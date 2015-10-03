/*global module*/
module.exports = function (grunt) {
    'use strict';
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        project: {
            app: [],
            assets: ['assets'],
            release: ['release'],
            bowerDirectory: ['bower_components'],
            styleDirectory: ['css'],
            jsDirectory: ['src'],
            CSSFilename: ['style.min.css'],
            BowerJSFilename: ['bower.js'],
            css: ['<%= project.assets %>/sass/style.scss'],
            inputCSS: ['<%= project.assets %>/<%= project.styleDirectory %>/<%= project.CSSFilename %>'],
            outputCSS: ['<%= project.release %>/<%= project.assets %>/<%= project.styleDirectory %>/<%= project.CSSFilename %>']
        },
        includeSource: {
            options: {
                templates: {
                    html: {
                        js: '<script src="{filePath}"></script>'
                    }
                }
            },
            myTarget: {
                files: {
                    'index.html': 'index.tpl.html'
                }
            }
        },
        wiredep: {

            dev: {
                // Point to the files that should be updated when
                // you run `grunt wiredep`
                src: [
                    'index.html'
                ],
                exclude: [
                    'bower_components/bootstrap-sass-official/assets/javascripts'
                ],
                options: {
                    // See wiredep's configuration documentation for the options
                    // you may pass:
                    devDependencies: true
                    // https://github.com/taptapship/wiredep#configuration
                }
            }
        }
    });
    //Load the plugin that provides the "include-source" task
    grunt.loadNpmTasks('grunt-include-source');
    grunt.loadNpmTasks('grunt-wiredep');
    // Include task(s).
    grunt.registerTask('default', ['includeSource', 'wiredep']);
    };
