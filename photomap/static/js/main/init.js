/*jslint */
/*global $, $$, gettext */

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
require(["main/Main", "dojo/domReady!"], function (Main) {

   // $$("body").css({
   //    "max-height" :  "500px",
   //    "min-height" : "0px",
   // });
   // // $$(".mp-page-title").css({
   // //    "200);
   // $$(".mp-logo").css({
   //    "width" : "20px",
   //    "height" : "30px"
   // })
   //    .remove();
   main = new Main();
   // initialise js-classes
   main.preinit();
});

