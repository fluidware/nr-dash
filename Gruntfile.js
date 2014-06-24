module.exports = function (grunt) {
	var fs  = require("fs"),
	    ref = [];

	// Building object structure of templates (to be embedded),
	// doing this outside of a task for reference reasons (hence Array!)
	(function (ref) {
		var files = fs.readdirSync("./templates"),
		    tmp   = {};

		files.forEach( function ( i ) {
			var name = i.replace(/\..*/, ""),
			    data = fs.readFileSync("./templates/" + i);

			tmp[name] = data.toString();
		});

		ref.push(JSON.stringify(tmp).replace(/^"|"$/g, ""));
	})(ref);

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
				         " * @copyright <%= grunt.template.today('yyyy') %> Fluidware\n" +
				         " * @license <%= pkg.licenses[0].type %> <<%= pkg.licenses[0].url %>>\n" +
				         " * @link <%= pkg.homepage %>\n" +
				         " * @version <%= pkg.version %>\n" +
				         " */\n"
			},
			dist: {
				src : [
					"<banner>",
					"src/intro.js",
					"src/click.js",
					"src/error.js",
					"src/events.js",
					"src/generate.js",
					"src/hashchange.js",
					"src/init.js",
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
			"templates" : {
				pattern : "{{TEMPLATES}}",
				replacement : ref[0],
				path : ["<%= concat.dist.dest %>"]
			},
			"version" : {
				pattern : "{{VERSION}}",
				replacement : "<%= pkg.version %>",
				path : ["<%= concat.dist.dest %>"]
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

	// aliases
	grunt.registerTask("test", ["jshint"/*, "nodeunit"*/]);
	grunt.registerTask("build", ["concat", "sed", "sass"]);
	grunt.registerTask("default", ["build", "test"]);
};