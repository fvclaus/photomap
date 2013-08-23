/*jslint sloppy : true*/
/*global $, define, $$, main, DASHBOARD_VIEW, ALBUM_VIEW, window, assert, assertTrue */

// No use strict with this.inherited(arguments);
// "use strict";

define([
   "dojo/_base/declare",
   "./Widget",
   "../util/Communicator",
   "../model/Model",
   "../model/Photo",
   "../model/Place",
   "../model/Album",
   "../util/Tools",
   "dojo/text!./templates/ModelOperation.html",
   "dojo/i18n",
   "dojo/i18n!./nls/ModelOperation"],
       function (declare, Widget, communicator, Model, Photo, Place, Album, tools, template, i18n) {
       return declare(Widget, {
          templateString : template,
          viewName : "ModelOperation",

          startup : function (options) {
             if (this._started) {
                return;
             }

             this.$container.hide();
             if (options && typeof options.shareOperation === "boolean" && !options.shareOperation) {
                this.$share.hide();
             }
                
             // tells the hide function whether or not the mouse entered the window
             this.$container.isEntered = false;
             this._modelInstance = null;

             this.inherited(arguments);

             assertTrue(this.$delete.size() > 0 && this.$update.size() > 0, "Operation controls need to be present.");
          },
          postMixInProperties : function () {
             this.inherited(arguments);
             this.messages = i18n.getLocalization("keiken/widget", "ModelOperation", this.lang);
          },
          /**
           * @public
           * @description Displays operation controls below or above Model representation
           * @param options.modelInstance {Photo,Place,Album}
           * @param options.offset {Object} Contains top and left attribute. For Place & Album top needs to be the bottom.
           * @param options.dimension {Object} Contains width.
           */
          show : function (options) {
             assertTrue(options.modelInstance.isInstanceOf(Model), "input parameter element must be instance of Album or Place");
             
             // set the context for the Controls-Dialog (current Album, Place, Photo)                           
             this._modelInstance = options.modelInstance;

             var width = options.dimension.width,
                 center = {
                    top : options.offset.top,
                    left : options.offset.left
                 };

             //TODO Is this still needed?
             // this happens when the Icon representing the Marker is not loaded yet
             // this should only happen during frontend tests
             if (width === undefined) {
                //TODO find a better way to do this
                width = 18;
             }

             if (options.modelInstance.isInstanceOf(Place) || options.modelInstance.isInstanceOf(Album)) {
                // box is glued under the marker. this looks ugly, but is necessary if multiple markers are close by another
                center.top *= 1.01;
             } else if (options.modelInstance.isInstanceOf(Photo)) {
                center.top -= (tools.getRealHeight($(".mp-controls-wrapper")) + 5);
                // clear any present timeout, as it will hide the controls while the mousepointer never left
                if (this.hideControlsTimeoutId) {
                   window.clearTimeout(this.hideControlsTimeoutId);
                   this.hideControlsTimeoutId = null;
                }
             } else {
                throw new Error("Unknown model " + options.modelInstance + ".");
             }

             // Center box.
             center.left += width / 2;

             // show controls
             this._showMarkerControls(center);
          },

          /**
           * @description Hides the operation controls.
           * @param {Boolean} timeout if the controls should be hidden after a predefined timout, when the controls are not entered again.
           */
          hide : function (timeout) {
             
             var instance = this, 
                 hide = function () {
                    if (instance.$container.isEntered) {
                       return;
                    }
                    instance.$container.hide();
                 };

             if (timeout) {
                this.hideControlsTimeoutId = window.setTimeout(hide, 2000);
             } else {
                this.$container.hide();
             }
          },


          /**
           * @description Controls are instantiated once and are used for albums, places and photos
           * @param {Object} center The bottom center of the element where the controls should be displayed
           * @private
           */
          _showMarkerControls : function (center) {
             
             var factor;
             
             // calculate the offset
             // center the controls below the center
             center.left -= tools.getRealWidth(this.$container) / 2;


             // offset had a weird problem where it was pushing the controls down with every 2 consecutive offset calls
             this.$container.css({
                top: center.top,
                left: center.left,
                display : "inline-block"
             });
             // .show();
          },
          /**
           * @private
           */
          _bindListener : function () {
             var instance = this, 
                 place = null;

             this.$update
                .on("click", function (event) {
                  communicator.publish("clicked:UpdateOperation", instance._modelInstance);
                });
             this.$delete
                .on("click", function (event) {
                   communicator.publish("clicked:DeleteOperation", instance._modelInstance);
                });

             this.$share
                .on("click", function (event) {
                  communicator.publish("clicked:ShareOperation", instance._modelInstance);
                });
             
             
             this.$container
                .on("mouseleave", function () {
                   instance.$container.hide();
                   instance.$container.isEntered = false;
                })
                .on("mouseenter", function () {
                   instance.$container.isEntered = true;
                });
          }
       });
    });