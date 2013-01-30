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
   this.thumb = data.thumb;
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
         $("img[src='" + this.thumb + "']").addClass("visited");
      }
   },
   showBorder : function (bool) {
      this.visited = bool;
      main.getClientState().addPhoto(this.id);
      this.checkBorder();
   },
   triggerClick : function () {
      this.openPhoto();
   },
   openPhoto : function () {
      var $thumb = main.getUI().getGallery().getImageBySource(this.source);
      main.getUIState().setCurrentLoadedPhoto(this);
      //TODO uncomment this when getImageBySource works again
      // if ($thumb.length === 0){
      //    throw new Error("Photo must always have a $thumb");
      // }
      //TODO this does not seem to work anymore with the new .on jQuery listener style
      $thumb.trigger("click");
   }
};

