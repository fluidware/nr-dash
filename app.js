"use strict";

var TurtleIO = require( "turtle.io"),
    keigai   = require( "keigai" ),
    config   = require( "./config.json" ),
    app      = new TurtleIO(),
    DEFAULT  = config["default"] || "localhost",
    vhosts   = {};

if ( !config.api || !config.data ) {
	console.error( "Invalid configuration" );
	process.exit( 1 );
}

// Setting web app directory
vhosts[DEFAULT] = "www";

// Removing unneeded key
delete config["default"];

// Creating API abstraction without using a proxy
app.get("/keys", function (req, res) {
	app.respond(req, res, config);
}, DEFAULT);

// Starting server
app.start({
	root    : "./",
	default : DEFAULT,
	vhosts  : vhosts
});
