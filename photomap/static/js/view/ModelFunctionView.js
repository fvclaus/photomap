/*jslint */
/*global $, define, $$, main, DASHBOARD_VIEW, ALBUM_VIEW, window, assert, assertTrue */

"use strict";


define(["dojo/_base/declare", "presenter/ModelFunctionPresenter"],
       function (declare, ModelFunctionPresenter) {
          return  declare(null, {
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

                this.presenter = new ModelFunctionPresenter();
             },
             initialize : function () {
                main.getCommunicator().subscribeOnce("processed:initialData", this._finalizeInitialization, this);
             },
             /**
              * @description Displays modify control under a photo
              * @param $el The photo element under which controls are placed
              * @public
              */
             showPhotoControls : function ($el) {
                
                var center, tools;
                
                center = $el.offset();
                tools = main.getTools();
                center.left += tools.getRealWidth($el) / 2;
                center.top -= (tools.getRealHeight($(".mp-controls-wrapper")) + 5);

                // clear any present timeout, as it will hide the controls while the mousepointer never left
                if (this.hideControlsTimeoutId) {
                   window.clearTimeout(this.hideControlsTimeoutId);
                   this.hideControlsTimeoutId = null;
                }
                this._showMarkerControls(center);
             },
             _finalizeInitialization : function () {
                var state =  main.getUIState(),
                    clientstate = main.getClientState();

                if (state.isDashboardView() || (state.isAlbumView() && clientstate.isAdmin())) {
                   this._bindListener();
                }
             },

             /**
              * @description Controls are instantiated once and are used for albums, places and photos
              * @param {Object} center The bottom center of the element where the controls should be displayed
              * @private
              */
             _showMarkerControls : function (center) {
                
                var tools, factor;
                
                // calculate the offset
                tools = main.getTools();
                // center the controls below the center
                center.left -= tools.getRealWidth(this.$controls) / 2;

                // don't resize the icons all the time to save performance
                if (!this.$controls.isScaled) {
                   // change factor depending on the page (-> number of controls in control-box)
                   // if (main.getUIState().isDashboardView()) {
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
              * @description This is used to select the model the user wants to change and to show the controls
              * @param {Album,Place} instance
              * @private
              */
             show : function (element) {
                var instance = this;
                //TODO there is a circular reference place -> infomarker -> markerpresenter -> modelfunctionview -> modelfunctionpresenter -> place
                require(["model/Photo", "model/Place", "model/Album"],
                        function (Photo, Place, Album) {
                           assertTrue(element instanceof Album || element instanceof Place, "input parameter element must be instance of Album or Place");

                           var state = main.getUIState(), 
                               projection, pixel, markerSize, mapOffset;

                           if (element instanceof Album) {
                              instance.presenter.setModifyAlbum(true);
                              state.setCurrentAlbum(element);
                           } else if (element instanceof Place) {
                              instance.presenter.setModifyPlace(true);
                              state.setCurrentPlace(element);
                           }
                           // gets the absolute pixel position
                           pixel = main.getMap().getPositionInPixel(element);
                           markerSize = element.getSize();
                           // this happens when the Icon representing the Marker is not loaded yet
                           // this should only happen during frontend tests
                           if (markerSize === undefined) {
                              //TODO find a better way to do this
                              markerSize = { width : 18 }; 
                           }

                           // center box under marker
                           pixel.left += markerSize.width / 2;
                           // show controls
                           // box is glued under the marker. this looks ugly, but is necessary if multiple markers are close by another
                           instance._showMarkerControls(pixel);
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
             /**
              * @private
              */
             _bindListener : function () {
                var instance = this, 
                    place = null, 
                    state = main.getUIState();

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