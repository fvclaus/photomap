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
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",
        "view/View",
        "view/PhotoCarouselView",
        "model/Photo",
        "util/Communicator",
        "util/Tools",
        "util/InfoText",
        "dojo/text!/template/Slideshow",
        "module",
        "dojo/domReady!"
       ],
       function (declare, _WidgetBase, _TemplatedMixin, View, PhotoCarouselView, Photo, communicator, tools, InfoText, template, module) {
          return declare([View, _WidgetBase, _TemplatedMixin], {
             templateString : template,
             buildRendering : function () {
                this.inherited(arguments);
                var instance = this;
                this._attachPoints.forEach(function (attachPoint) {
                   var jQSelectorName = "$" + attachPoint.replace("Node", "");
                   instance[jQSelectorName] = $(instance[attachPoint]);
                });
                this.$container = $(this.domNode);
             },
             startup : function () {
                if (this._started) {
                   return;
                }
                this.inherited(arguments);
                // Needed to determine the MID in the logging statements.
                this.module = module;
                this.viewName = "Slideshow";
                this.carousel = null;
                
                // tooltip is a builtin member of _WidgetBase
                this._infoText = new InfoText(this.$container, "", {hideOnMouseover: false});
                
                // this._started = false;
                this._loaded = false;
                
                this._bindActivationListener(this.$container, this.viewName);
                var instance = this;
                
                this._center();
                // everything that gets centered manually must be corrected on a resize event
                $(window).resize(function () {
                   instance._center();
                });
                this._bindListener();
                this.updateMessage();

                this.options = {
                   lazy : true,
                   loader : this.$loader,
                   beforeLoad : this._beforeLoad,
                   afterLoad : this._afterLoad,
                   onUpdate : this._update,
                   context : this
                };
                this.srcPropertyName = "photo";
             },
             /*
              * @public
              */
             load : function (photos) {
                assertInstance(photos, Array, "Photos must be of type Array.");
                assert(this._started, true, "Must call startup() before.");
                // Resets to state after startup().
                this.reset();
                this._loaded = true;

                this.carousel = new PhotoCarouselView(this.$imageWrapper.find("img.mp-slideshow-image"), photos, this.srcPropertyName, this.options);
             },
             /**
              * @presenter
              * @description starts slideshow by initialising and starting the carousel 
              * @param {Photo} photo: Null to start with the first photo.
              */
             run: function (photo) {
                assert(this._started, true, "Must call startup() before.");
                assertTrue(this._loaded, "Must call load(photos) before.");

                // this._started = true;
                this._run = true;

                // initialize carousel
                // this.carousel = new PhotoCarouselView(this.$imageWrapper.find("img.mp-slideshow-image"), photos, "photo", options);
                
                if (this.carousel.getAllPhotos().length !== 0) {
                   //TODO this should be a selector in the constructor
                   $(".mp-slideshow-no-image-msg").hide();
                   // it is also possible to start the Carousel with empty photos, but we need to hide the no-images-msg
                   this.carousel.start(photo);
                }

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
             /**
              * @presenter
              * @description Navigates to given index; starts slideshow if carousel is not yet initialized
              * @param {Photo} photo
              */
             navigateTo : function (photo) {
                // Navigate to photo, displaying it when the slideshow is started
                assertTrue(photo instanceof Photo || photo === null, "Parameter photo must be an instance of Photo.");
                if (!this._run) {
                   this.run();
                } else {
                   this.carousel.navigateTo(photo);
                }
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
             /**
              * @presenter
              * @description Inserts a new Photo. This will not move the Carousel or do anything else.
              */
             insertPhoto : function (photo) {
                assertTrue(photo instanceof Photo, "input parameter photo has to be instance of Photo");
                assertTrue(this._loaded, "Must call load(photos) before.");
                // Slideshow might or might not be started at that point
                this.carousel.insertPhoto(photo);
             },
             /**
              * @presenter
              * @description Deletes an existing Photo. If Photo is the current Photo the previous Photo is shown.
              * If there is no previous Photo, nothing is shown.
              */
             deletePhoto : function (photo) {
                assertTrue(photo instanceof Photo, "input parameter photo has to be instance of Photo");
                assertTrue(this._loaded, "Must call load(photos) before.");
                // Slideshow might or might not be started at that point
                this.carousel.deletePhoto(photo);
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
              * @description Synchronizes the current photo in the slideshow with the one in the UIState
              * @returns {Photo} currentPhoto
              */
             _findCurrentPhoto : function () {
                assert(this._started, true, "slideshow has to be started already");

                var photos = this.carousel.getAllPhotos(),
                    currentPhoto = null,
                    // The PhotoCarousel will set the id of the photo as an attribute of the img element.
                    id = parseInt(this.$image.attr(this.carousel.ID_HTML_ATTRIBUTE));

                // if it is the only (empty) page the entry is null
                if (photos.length > 0) {
                   currentPhoto = tools.getObjectByKey("id", id, photos);
                }
                this.currentPhoto = currentPhoto;
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
