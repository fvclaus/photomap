/*jslint */
/*global $, Main */

"use strict";


/**
 * Photo Map
 *
 *
 * Copyright 2011 - 2012, Frederik Claus, Marc-Leon Römer
 * Original Code by Pedro Botelho
 *   Multi-level Photo Map -> http://www.codrops.com/
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Date: Dec 2011
 */

var main = null;

/**
 * @description Initializes main constructor. Needs document ready!
 */
$(document).ready(function () {
   
   $("body").css({
      height : $("body").height() - 10 + "px",
      margin: "5px 0"
   });
   
   main = new Main();
   // initialise js-classes
   if (main && main.initWithoutAjax) {
      main.initWithoutAjax();
   } else {
      main.init();
   }
});

