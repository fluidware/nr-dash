"use strict";

var TurtleIO = require( "turtle.io"),
    config   = require( "./config.json" ),
    HOSTNAME = config["hostname"] || "localhost",
    app      = new TurtleIO(),
    vhosts   = {};

if ( !config.api ) {
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
	port    : config.port || 8000,
	//uid     : 101, // uid of account to drop to when starting with priviledges (low port)
	default : HOSTNAME,
	vhosts  : vhosts
} );
