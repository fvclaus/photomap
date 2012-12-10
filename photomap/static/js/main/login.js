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
   
   $("section.mp-tabs").tabs("section.mp-panes > section");
   $(".mp-non-interactive-content").css("height", "80.5%");
   tools.centerElement($container, $(".mp-tabs"), "horizontal");
   tools.centerChildren($(".mp-tabs"), "horizontal");
   tools.centerElement($container, $(".mp-panes section"), "horizontal");
   cursor.setCursor($(".mp-tabs > span"), cursor.styles.pointer);
}

