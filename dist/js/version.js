// Sets the copyright date & version
( function ( util, nrDash ) {
"use strict";

var $       = util.$,
    element = util.element;

element.html( $( "#year" )[0], new Date().getFullYear() );
element.html( $( "#version" )[0], nrDash.version );
} )( keigai.util, nrDash );
