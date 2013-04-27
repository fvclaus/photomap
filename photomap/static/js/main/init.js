/*jslint */
/*global $, $$, gettext*/

"use strict";


/**
 * Photo Map
 *
 *
 * Copyright 2011 - 2012, Frederik Claus, Marc-Leon Römer
 *
 * Date: Dec 2011
 */

var main = null;

/**
 * @description Initializes main constructor. Needs document ready!
 */
require(["main/AppInitializer", "dojo/domReady!"], function (AppInitializer) {

   // main = new Main();
   // // initialise js-classes
   // main.preinit();
   var appInit = new AppInitializer();
   appInit.start();
});

