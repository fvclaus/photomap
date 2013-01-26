/*jslint */
/*global $, main, DASHBOARD_VIEW, ALBUM_VIEW, UIPhotoListener, UIPlaceListener, UIAlbumListener, window */

"use strict";

var UIEditControls = function () {
   this.$controls = $(".mp-controls-wrapper");
   this.$controls.hide();
   // icons of photo controls are not scaled yet
   this.$controls.isScaled = false;
   // tells the hide function whether or not the mouse entered the window
   this.$controls.isEntered = false;

};

UIEditControls.prototype = {
   /**
    * @description Displays modify control under a photo
    * @param $el The photo element under which controls are placed
    * @public
    */
   showPhotoControls : function ($el) {
      
      var center, tools;
      
      center = $el.offset();
      tools = main.getUI().getTools();
      center.left += tools.getRealWidth($el) / 2;
      center.top -= (tools.getRealHeight($(".mp-controls-wrapper")) + 5);

      // clear any present timeout, as it will hide the controls while the mousepointer never left
      if (this.hideControlsTimeoutId) {
         window.clearTimeout(this.hideControlsTimeoutId);
         this.hideControlsTimeoutId = null;
      }
      this._showMarkerControls(center);
   },

   /**
    * @description Controls are instantiated once and are used for albums, places and photos
    * @param {Object} center the bottom center of the element where the controls should be displayed
    * @private
    */
   _showMarkerControls : function (center) {
      
      var tools, factor;
      
      // calculate the offset
      tools = main.getUI().getTools();
      // center the controls below the center
      center.left -= tools.getRealWidth(this.$controls) / 2;

      // don't resize the icons all the time to save performance
      if (!this.$controls.isScaled) {
         // change factor depending on the page (-> number of controls in control-box)
         if (main.getUIState().isDashboard()) {
            factor = 1.5;
         } else {
            factor = 1;
         }
         this.$controls
            .width(this.$controls.width() * factor);
         this.$controls.isScaled = true;
      }

      // offset had a weird problem where it was pushing the controls down with every 2 consecutive offset calls
      this.$controls.css({
         top: center.top,
         left: center.left
      }).show();
   },



   /**
    * @description This is used as a callback to display the edit controls
    * @param {Album,Place} instance
    * @private
    */
   show : function (element) {
      
      var state, controls, projection, pixel, markerSize, mapOffset;
      state = main.getUIState();
      controls = main.getUI().getControls();

      if (element.getModel() === 'Album') {
         controls.setModifyAlbum(true);
         state.setCurrentAlbum(element);
      } else if (element.getModel() === 'Place') {
         controls.setModifyPlace(true);
         state.setCurrentPlace(element);
      } else {
         alert("Unknown class: " + element);
         return;
      }

      // gets the relative pixel position
      pixel = main.getMap().getPositionInPixel(element);
      // add height and half-width of the marker
      markerSize = element.getSize();
      pixel.top += markerSize.height;
      pixel.left += markerSize.width / 2;
      // show controls
      this._showMarkerControls(pixel);
   },

   /**
    * @description hides the modify controls
    * @param {Boolean} timeout if the controls should be hidden after a predefined timout, when the controls are not entered
    * @private
    */
   hide : function (timeout) {
      
      var instance = this, hide;
      
      hide = function () {
         if (instance.$controls.isEntered) {
            return;
         }
         instance.$controls.hide();
      };

      if (timeout) {
         this.hideControlsTimeoutId = window.setTimeout(hide, 2000);
      } else {
         this.$controls.hide();
      }
   },
   bindListener : function () {
      
      var instance = this, place, state;
      state = main.getUIState();
      
      this.$controls
         .on("mouseleave", function () {
            instance.$controls.hide();
            instance.$controls.isEntered = false;
         })
         .on("mouseenter", function () {
            instance.$controls.isEntered = true;
         });
   },
};