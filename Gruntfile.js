module.exports = function (grunt) {
	grunt.initConfig({
		pkg : grunt.file.readJSON("package.json"),
		concat: {
			options : {
				banner : "/**\n" + 
				         " * <%= pkg.name %>\n" +
				         " *\n" +
				         " * <%= pkg.description %>\n" +
				         " *\n" +
				         " * @author <%= pkg.author.name %> <<%= pkg.author.email %>>\n" +
				         " * @copyright <%= grunt.template.today('yyyy') %> SurveyMonkey\n" +
				         " * @license <%= pkg.licenses[0].type %> <<%= pkg.licenses[0].url %>>\n" +
				         " * @link <%= pkg.homepage %>\n" +
				         " * @version <%= pkg.version %>\n" +
				         " */\n"
			},
			dist: {
				src : [
					"<banner>",
					"src/intro.js",
					"src/chart.js",
					"src/chartGrid.js",
					"src/chartGridTransform.js",
					"src/click.js",
					"src/cycle.js",
					"src/error.js",
					"src/events.js",
					"src/generate.js",
					"src/hashchange.js",
					"src/init.js",
					"src/metrics.js",
					"src/view.js",
					"src/interface.js",
					"src/outro.js"
				],
				dest : "dist/js/<%= pkg.name %>.js"
			}
		},
		jshint : {
			options : {
				jshintrc : ".jshintrc"
			},
			src : "dist/js/<%= pkg.name %>.js"
		},
		nodeunit : {
			all : ["test/*.js"]
		},
		sass: {
			dist: {
				options : {
					style: "compressed"
				},
				files: {
					"dist/css/style.css": "sass/style.scss"
				}
			}
		},
		sed : {
			"version" : {
				pattern : "{{VERSION}}",
				replacement : "<%= pkg.version %>",
				path : ["<%= concat.dist.dest %>"]
			}
		},
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> - <%= pkg.version %> */'
			},
			dist: {
				files: {
					'dist/js/nr-dash.min.js': ['dist/js/nr-dash.js']
				}
			}
		},
		watch : {
			grunt : {
				files : "./Gruntfile.js",
				tasks : "default"
			},
			js : {
				files : "<%= concat.dist.src %>",
				tasks : "default"
			},
			pkg: {
				files : "package.json",
				tasks : "default"
			},
			sass: {
				files : "./sass/*",
				tasks : "default"
			},
			templates: {
				files : "./templates/*",
				tasks : "default"
			}
		}
	});

	// tasks
	grunt.loadNpmTasks("grunt-sed");
	grunt.loadNpmTasks("grunt-contrib-sass");
	grunt.loadNpmTasks("grunt-contrib-concat");
	grunt.loadNpmTasks("grunt-contrib-nodeunit");
	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-uglify');

	// aliases
	grunt.registerTask("test", ["jshint"/*, "nodeunit"*/]);
	grunt.registerTask("build", ["concat", "sed"]);
	grunt.registerTask("default", ["build", "test", "uglify", "sass"]);
};