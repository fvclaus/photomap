/*jslint */
/*global $, main */

"use strict";


/**
 * @description Resizes and positions Login and Registration forms next to each other
 */

var cursor, tools, $container;


function initialize() {
   
   $container = $(".mp-non-interactive-content");
   tools = main.getUI().getTools();
   cursor = main.getUI().getCursor();
   
}

