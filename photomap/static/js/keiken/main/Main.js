/*jslint */
/*global define, Tools, preinit, init, initializeTest, window */

"use strict";


/**
 * @author Frederik Claus
 * @class Initializes main classes.
 */

define([
   "dojo/_base/declare",
   "../ui/UI",
   "../view/MapView",
   "./AppController",
   "./AppModelController"
],
   function (declare, ui, MapView, AppController, AppModelController) {

      return declare(null, {
         
         constructor : function (args) {
            
            this.ui = ui;
            this.appController = new AppController();
            this.appModelController = new AppModelController();
         },
   
         init : function () {
            this.map = new MapView();
         },
         getMap : function () {
            return this.map.getPresenter();
         },
         getUI : function () {
            return this.ui;
         }
      });
   });