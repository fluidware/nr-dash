"use strict";

var TurtleIO = require( "turtle.io"),
    config   = require( "./config.json" ),
    HOSTNAME = config["hostname"] || "localhost",
    app      = new TurtleIO(),
    vhosts   = {};

if ( !config.keys.api || !config.keys.data ) {
	console.error( "Invalid configuration" );
	process.exit( 1 );
}

vhosts[HOSTNAME] = "dist";

delete config["hostname"];

app.get( "/config", function ( req, res ) {
	app.respond( req, res, config );
}, HOSTNAME );

app.start( {
	root    : ".",
	default : HOSTNAME,
	vhosts  : vhosts
} );
