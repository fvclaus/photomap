
/*jslint */
/*global $, define, $$, main, DASHBOARD_VIEW, ALBUM_VIEW, window, assert, assertTrue */

"use strict";


define([
   "dojo/_base/declare",
   "view/View",
   "presenter/ModelFunctionPresenter",
   "util/Communicator",
   "util/Tools",
   "util/ClientState",
   "ui/UIState"
   ],
    function (declare, View, ModelFunctionPresenter, communicator, tools, clientstate, state) {
       return  declare(View, {
          constructor : function () {
             this.$controls = $$(".mp-controls-wrapper");
             this.$controls.hide();
             // icons of photo controls are not scaled yet
             this.$controls.isScaled = false;
             // tells the hide function whether or not the mouse entered the window
             this.$controls.isEntered = false;


             this.$delete = this.$controls.find("img.mp-option-delete");
             this.$update = this.$controls.find("img.mp-option-modify");
             this.$share = this.$controls.find("img.mp-option-share");

             assertTrue(this.$delete.size() > 0 && this.$update.size() > 0);

             this.presenter = new ModelFunctionPresenter(this);
             
             communicator.subscribeOnce("init", this._init, this);
          },
          /**
           * @description Displays modify control under a photo
           * @param $el The photo element under which controls are placed
           * @public
           */
          showPhotoControls : function (data) {
             
             var center;
             
             this.presenter.setCurrentContext(data.context);
             
             center = data.element.offset();
             center.left += tools.getRealWidth(data.element) / 2;
             center.top -= (tools.getRealHeight($(".mp-controls-wrapper")) + 5);

             // clear any present timeout, as it will hide the controls while the mousepointer never left
             if (this.hideControlsTimeoutId) {
                window.clearTimeout(this.hideControlsTimeoutId);
                this.hideControlsTimeoutId = null;
             }
             this._showMarkerControls(center);
          },
          /**
           * @description This is used to select the model the user wants to change and to show the controls
           * @param {Album,Place} instance
           * @private
           */
          show : function (data) {
             var instance = this;
             //TODO there is a circular reference place -> infomarker -> markerpresenter -> modelfunctionview -> modelfunctionpresenter -> place
             require(["model/Photo", "model/Place", "model/Album"],
                     function (Photo, Place, Album) {
                        assertTrue(data.context.getModel() instanceof Album || data.context.getModel() instanceof Place, "input parameter element must be instance of Album or Place");
                        var projection, markerSize, mapOffset;
                        
                        // set the context for the Controls-Dialog (current Album, Place, Photo)                           
                        instance.presenter.setCurrentContext(data.context);

                        markerSize = data.context.getView().getSize();
                        // this happens when the Icon representing the Marker is not loaded yet
                        // this should only happen during frontend tests
                        if (markerSize === undefined) {
                           //TODO find a better way to do this
                           markerSize = { width : 18 }; 
                        }

                        // center box under marker
                        data.pixel.left += markerSize.width / 2;
                        data.pixel.top *= 1.01;
                        // show controls
                        // box is glued under the marker. this looks ugly, but is necessary if multiple markers are close by another
                        instance._showMarkerControls(data.pixel);
                     });
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
          _init : function () {

             if (state.isDashboardView() || (state.isAlbumView() && state.isAdmin())) {
                this._bindListener();
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
             center.left -= tools.getRealWidth(this.$controls) / 2;

             // don't resize the icons all the time to save performance
             if (!this.$controls.isScaled) {
                // change factor depending on the page (-> number of controls in control-box)
                // if (state.isDashboardView()) {
                //    factor = 1.5;
                // } else {
                //    factor = 1;
                // }
                // this.$controls
                //    .width(this.$controls.width() * factor);
                // this.$controls.isScaled = true;
             }

             // offset had a weird problem where it was pushing the controls down with every 2 consecutive offset calls
             this.$controls.css({
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
                   instance.presenter.update(event);
                });
             this.$delete
                .on("click", function (event) {
                   instance.presenter.delete(event);
                });

             this.$share
                .on("click", function (event) {
                   instance.presenter.share(event);
                });
             
             
             this.$controls
                .on("mouseleave", function () {
                   instance.$controls.hide();
                   instance.$controls.isEntered = false;
                })
                .on("mouseenter", function () {
                   instance.$controls.isEntered = true;
                });
          }
       });
    });