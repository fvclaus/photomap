/*jslint */
/*global $, main, UIPanel, UICursor, UITools */

"use strict";

/**
 * @author Marc-Leon Römer
 * @class UI is a wrapper class for everything which is visible for the user
 * @requires UIPanel, UICursor, UITools
 */

var UI;

UI = function () {

   this.panel = new UIPanel();
   this.cursor = new UICursor();
   this.tools = new UITools();
   this.state = new UIState();
};

UI.prototype = {

   init : function () {
      this.panel.initWithoutAjax();
      this.panel.initAfterAjax();
      this.cursor.initWithoutAjax();
   },
   getPanel : function () {
      return this.panel;
   },
   getCursor : function () {
      return this.cursor;
   },
   getTools : function () {
      return this.tools;
   },
   getState : function () {
      return this.state;
   }
};