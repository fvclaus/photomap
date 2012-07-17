/**
 * Photo Map
 *
 *
 * Copyright 2011, Frederik Claus
 * Original Code by Pedro Botelho 
 *   Multi-level Photo Map -> http://www.codrops.com/
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Date: Dec 2011
 */

var $mpContainer = $('#mp-container');
//http://stevenbenner.com/2010/04/calculate-page-size-and-view-port-position-in-javascript/
$mpContainer
    .width($(window).width()-17)
    .height($(window).height()-17);

var main = new Main();
main.init();

// reposition description overlay
var information = main.getUI().getInformation();
information.resizeRepositionDescription();
