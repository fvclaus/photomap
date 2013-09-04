/*jslint */
/*global document, $*/

"use strict";

$(document).ready(function () {
   console.log("This is the dashboard.");
   $(".mp-column-closer").button();
   $(".mp-full-column-controls").height($(".mp-column-closer").height() + 5 + "px");
});