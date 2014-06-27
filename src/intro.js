( function ( document, window, keigai, moment, dimple ) {
"use strict";

var store     = keigai.store,
    grid      = keigai.grid,
    util      = keigai.util,
    $         = util.$,
    array     = util.array,
    element   = util.element,
    log       = util.log,
    stop      = util.stop,
    prevent   = util.prevent,
    request   = util.request,
    target    = util.target,
    when      = util.when,
    hash      = document.location.hash.replace( "#", "" ),
    headers   = {},
    config    = {},
    stores    = {},
    render    = util.render,
    PILLS     = $( "ul.pills" )[0],     // expected Element
    COPY      = $( "section.copy" )[0], // expected Element
    NOTHASH   = /.*\#/,
    OPTIONS, DEFAULT;
