/*jslint */
/*global $, $$, Main, document, gettext */

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
$(document).ready(function () {
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
   if (main && main.preinit) {
      main.preinit();
   } else if (main && main.init) {
      main.init();
   } else {
      alert(gettext("INITIALISATION_NOT_POSSIBLE"));
   }
});

