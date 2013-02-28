/*jslint */
/*global $, Main, document, gettext */

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

