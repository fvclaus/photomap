/*jslint sloppy : true*/
/*global $, define, window, gettext, assert, assertNotNull, assertTrue, assertInstance */

// No use strict with this.inherited(arguments);
// "use strict";

/**
 * @author Marc Roemer
 * @class UISlideshow displays the current selected Photo in the Slideshow
 * @requires UICarousel UIFullscreen
 */

define(["dojo/_base/declare",
        "widget/SinglePhotoWidget",
        "model/Photo",
        "util/Communicator",
        "util/Tools",
        "util/InfoText",
        "dojo/text!/template/Slideshow",
        "module",
        "dojo/domReady!"
       ],
       function (declare, SinglePhotoWidget, Photo, communicator, tools, InfoText, template) {
          return declare([SinglePhotoWidget], {
             templateString : template,

             viewName : "Slideshow",

             startup : function () {
                if (this._started) {
                   return;
                }
                this._carouselOptions = {
                   lazy : true,
                   loader : this.$loader,
                   beforeLoad : this._beforeLoad,
                   afterLoad : this._afterLoad,
                   onUpdate : this._update,
                   context : this
                };
                this._srcPropertyName = "photo";
                this.$photos = this.$imageWrapper.find("img.mp-slideshow-image");
                this.inherited(arguments);
                // Needed to determine the MID in the logging statements.
                
                // tooltip is a builtin member of _WidgetBase
                this._infoText = new InfoText(this.$container, "", {hideOnMouseover: false});
                
                this._center();
                // everything that gets centered manually must be corrected on a resize event
                var instance = this;
                $(window).resize(function () {
                   instance._center();
                });
                this.updateMessage();
             },
             /**
              * @presenter
              * @description Resets the slideshow
              * This will put the Slideshow in the state that it was after startup() was called.
              */
             reset : function () {
                // this._started = false;
                if (this._started) { 
                   if (this.carousel !== null) {
                      this.carousel.reset();
                      this.carousel = null;
                   }
                   this._loaded = false;
                   this._run = false;
                   this._emptyPhotoNumber();
                   this.updateMessage();
                }
             },
             /* 
              * @presenter
              * @description Restarts the slideshow if for example the photo order was changed. E.g. before load() and run()
              */
             restart : function (photos) {
                this.carousel.update(photos);
             },
             /*
              * @presenter
              * @description Navigates the slideshow left or right.
              * @param {String} direction: left || right
              */
             navigateWithDirection : function (direction) {
                assertTrue(direction === "left" || direction === "right", "slideshow can just navigate left or right");
                
                if (!this._run) {
                   this.run();
                } else {
                   if (direction === "left") {
                      this.carousel.navigateLeft();
                   } else {
                      this.carousel.navigateRight();
                   }
                }
             },
             /*
              * @presenter
              * @description Shows or hides information message, regarding the usage.
              */
             updateMessage : function () {
                if (!this._run) {
                   this._infoText
                      .setOption("hideOnMouseover", false)
                      .setMessage(gettext("SLIDESHOW_GALLERY_NOT_STARTED"))
                      .start()
                      .open();
                } else {
                   if (this.carousel.getAllPhotos().length !== 0) {
                      this._infoText.close();
                   } else {
                      // No photos yet.
                      this._infoText
                         .setOption("hideOnMouseover", true)
                         .setMessage(gettext("SLIDESHOW_NO_PHOTOS"))
                         .start()
                         .open();
                   }
                }
             },
             /**
              * @private
              * @description Executed after photo is updated (=displayed)
              */
             _update : function () {
                console.log("_update");
                this._findCurrentPhoto();
                // deleted last photo
                if (this.currentPhoto  === null) {
                   // Don't reset the slideshow.
                   this.updateMessage();
                } else {
                   // right now this is the first time we can update the description
                   // on the other events, beforeLoad & afterLoad, the photo src is not set yet
                   this._updatePhotoNumber();
                }
                communicator.publish("update:slideshow", this.currentPhoto);
                this.setDisabled(false);
             },
             /**
              * @private
              * @description Executed before photos are loaded
              */
             _beforeLoad : function ($photos) {
                // we are expecting to receive a jquery element wrapper
                assert(typeof $photos, "object", "input parameter $photos has to be a jQuery object");
                // trigger event to tell UI that slideshow is about to change
                // This will hide the detail view.
                communicator.publish("beforeLoad:slideshow");
                this.setDisabled(true);
             },
             /**
              * @private
              * @description Executed after photos are loaded
              */ 
             _afterLoad : function ($photos) {
                // we are expecting to receive a jquery element wrapper
                assert(typeof $photos, "object", "input parameter $photos has to be a jQuery object");
                
                this.updateMessage();
             },
             /**
              * @private
              * @description Updates current photo number
              */
             _updatePhotoNumber : function () {
                var photos = this.carousel.getAllPhotos(),
                    currentIndex = $.inArray(this.currentPhoto, photos);
                
                //TODO I think Photo is fine in every language
                this.$photoNumber.text("Photo "+(currentIndex + 1) + "/" + photos.length);
             },
             /**
              * @private
              * @description Removes the current photo number
              */
             _emptyPhotoNumber : function () {
                // 0/0 is a little misguiding. I suggest nothing instead.
                this.$photoNumber.text("");
             },
             /**
              * @private
              * @description Sets listener for both navigation elements and the image to start the fullscreen
              */
             _bindListener : function () {
                
                var instance = this;
                
                // No need to disable the navigation buttons.
                // If the current photo is not completely loaded, 
                // the loading will be aborted
                this.$navLeft.on("click", function () {
                   instance.navigateWithDirection("left");
                });
                this.$navRight.on("click", function () {
                   instance.navigateWithDirection("right");
                });
                
                this.$image.on("click.Slideshow", function (event) {
                   /* 
                    * bubbling of event has to be stopped to prevent click on slideshow to be triggered again 
                    * after Fullscreen is already focused, which causes activation problems (-> keyboard events!)
                    */
                   event.stopPropagation();

                   instance.log("Image clicked. Publishing event.");
                   communicator.publish("click:slideshowImage");

                });
                
                $("body")
                   .on("keyup.Slideshow", null, "left", function () {
                      if (instance._run) {
                         instance.log("Left direction key clicked. Navigating to the left.");
                         instance.$navLeft.trigger("click");
                      }
                   })
                   .on("keyup.Slideshow", null, "right", function () {
                      if (instance._run) {
                         instance.log("Right direction key clicked. Navigating to the right.");
                         instance.$navRight.trigger("click");
                      }
                   });
             },
             /**
              * @private
              * @description Center elements that cannot be centered with css right now
              */
             _center  : function () {
                //TODO is it really not possible to center those elements with css?
                tools.centerElement(this.$navLeft, "vertical");
                tools.centerElement(this.$navRight, "vertical");
                tools.centerElement(this.$loader, "vertical");
             }
          });
       });
