/*jslint */
/*global $, main */

"use strict";

/**
 * @author Frederik Claus
 * @class is stored in a place object, encapsulation of an marker
 */

var Photo;

Photo = function (data, index) {
   
   this.model = 'Photo';
   this.source = data.photo;
   this.title = data.title;
   this.description = data.description;
   this.id = data.id;
   this.order = data.order;
   this.visited = main.getClientState().isVisitedPhoto(this.id);
};

Photo.prototype = {
   getModel : function () {
      return this.model;
   },
   checkBorder : function () {
      //need reselection because anchors change
      if (this.visited) {
         $("img[src='" + this.source + "']").addClass("visited");
      }
   },
   showBorder : function (bool) {
      this.visited = bool;
      main.getClientState().addPhoto(this.id);
      this.checkBorder();
   },
   triggerClick : function () {
      $("img[src='" + this.source + "']").trigger("click");
   }
};

