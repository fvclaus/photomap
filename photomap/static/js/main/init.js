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
// add function to navigator to determine the browser and its version
navigator.sayswho= (function(){
    var N= navigator.appName, ua= navigator.userAgent, tem;
    var M= ua.match(/(opera|chrome|safari|firefox|msie)\/?\s*(\.?\d+(\.\d+)*)/i);
    if(M && (tem= ua.match(/version\/([\.\d]+)/i))!= null) M[2]= tem[1];
    M= M? [M[1], M[2]]: [N, navigator.appVersion, '-?'];

    return M;
})();
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

