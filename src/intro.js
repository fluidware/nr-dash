( function ( document, window, keigai ) {
"use strict";

var util    = keigai.util,
    $       = util.$,
    array   = util.array,
    element = util.element,
    stop    = util.stop,
    prevent = util.prevent,
    target  = util.target,
    hash    = document.location.hash.replace( "#", "" ),
    headers = {},
    config  = {},
    stores  = [],
    render  = window.requestAnimationFrame || util.delay,
    NOTHASH = /.*\#/,
    OPTIONS, DEFAULT;
