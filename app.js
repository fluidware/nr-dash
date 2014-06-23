"use strict";

var TurtleIO = require( "turtle.io"),
    config   = require( "./config.json" ),
    DEFAULT  = config["default"] || "localhost",
    app      = new TurtleIO(),
    vhosts   = {};

if ( !config.keys.api || !config.keys.data ) {
	console.error( "Invalid configuration" );
	process.exit( 1 );
}

// Setting web app directory
vhosts[DEFAULT] = "dist";

// Removing unneeded key
delete config["default"];

// Creating API abstraction without using a proxy
app.get( "/config", function ( req, res ) {
	app.respond( req, res, config );
}, DEFAULT );

// Starting server
app.start( {
	root    : ".",
	default : DEFAULT,
	vhosts  : vhosts
} );
