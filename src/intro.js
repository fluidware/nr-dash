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
    string    = util.string,
    prevent   = util.prevent,
    repeat    = util.repeat,
    request   = util.request,
    target    = util.target,
    walk      = util.walk,
    when      = util.when,
    hash      = document.location.hash.replace( "#", "" ),
    headers   = {},
    charts    = {},
    config    = {},
    stores    = {},
    render    = util.render,
    ZONE      = new Date().getTimezoneOffset(),
    PILLS     = $( "ul.pills" )[0],     // expected Element
    COPY      = $( "section.copy" )[0], // expected Element
    NOTHASH   = /.*\#/,
    OPTIONS, DEFAULT;
