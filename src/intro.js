( function ( document, window, keigai ) {
"use strict";

var store     = keigai.store,
    list      = keigai.list,
    grid      = keigai.grid,
    util      = keigai.util,
    $         = util.$,
    array     = util.array,
    element   = util.element,
    log       = util.log,
    stop      = util.stop,
    prevent   = util.prevent,
    target    = util.target,
    when      = util.when,
    hash      = document.location.hash.replace( "#", "" ),
    headers   = {},
    config    = {},
    grids     = [],
    lists     = [],
    stores    = [],
    templates = {{TEMPLATES}},
    render    = window.requestAnimationFrame || util.delay,
    PILLS     = $( "ul.pills" )[0],     // expected Element
    COPY      = $( "section.copy" )[0], // expected Element
    NOTHASH   = /.*\#/,
    OPTIONS, DEFAULT;
