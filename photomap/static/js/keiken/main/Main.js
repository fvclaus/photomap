/*jslint */
/*global define, Tools, preinit, init, initializeTest, window */

"use strict";


/**
 * @author Frederik Claus
 * @class Initializes main classes.
 */

define([
   "dojo/_base/declare",
   "../view/MapView"
],
   function (declare, MapView) {

      var Main = declare(null, {
         
         constructor : function () {
            this.map = new MapView();
         },
         getMap : function () {
            return this.map.getPresenter();
         }
      }),
          _instance = new Main();
      return _instance;
   });