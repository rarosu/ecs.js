module.exports = function(grunt) {
    var config = {
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            all: ['js/ecs.js']
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: 'js/<%= pkg.name %>.js',
                dest: 'build/<%= pkg.name %>.min.js'
            }
        },
        mocha: {
            all: {
                src: ['test/testrunner.html']
            },
            options: {
                run: true
            }
        }
    };
    
    grunt.initConfig(config);
    
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-mocha');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    
    grunt.registerTask('default', ['jshint', 'mocha', 'uglify']);
    grunt.registerTask('dev', ['jshint', 'mocha']);
};