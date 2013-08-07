/*jslint sloppy : true*/
/*global $, define, window, assertInstance, assert, assertTrue, gettext */

// No use strict with this.inherited(arguments);
// "use strict";

/**
 * @author Marc Roemer
 * @description Displays current slideshow-image as fullscreen, supports zooming into the image
 */
define(["dojo/_base/declare",
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",
        "view/View",
        "view/PhotoCarouselView",
        "model/Photo", 
        "util/Communicator", 
        "util/Tools",
        "dojo/text!/template/Fullscreen",
        "dojo/domReady!"], 
       function (declare, _WidgetBase, _TemplatedMixin, View, PhotoCarouselView, Photo, communicator, tools, template) {
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
                this.viewName = "Fullscreen";
                this.carousel = null;
                this.iconHelpCount = 5;
                this.$controls = $()
                   .add(this.$navLeft)
                   .add(this.$navRight)
                   .add(this.$close);
                
                assert(this.$controls.size(), 3, "there have to be 3 controls");
                

                //TODO this feature is currently on hold.
                // this.$description = $("#mp-fullscreen-image-description");

                
                this.visible = false;
                this.disabled = true;
                
                this._bindActivationListener(this.$container, this.viewName);
                this._bindListener();

                this.options = {
                   lazy : true,
                   loader : this.$loader,
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

                this.carousel = new PhotoCarouselView(this.$image, photos, this.srcPropertyName, this.options);
             },
             show : function () {
                
                this.$container.show();
                this.visible = true;
                // fullscreen is just active if mouse is moved or fullscreen is focused (needed for keyboard events)
                this.$container.focus();
                
             },
             hide : function () {
                this.$container.hide();
                this.$ready.hide();
                this.visible = false;
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
                if (this._run) {
                   return;
                }
                this._run = true;
                // initialize carousel
                // this.carousel = new PhotoCarouselView(this.$imageWrapper.find("img.mp-slideshow-image"), photos, "photo", options);
                
                if (this.carousel.getAllPhotos().length !== 0) {
                   // it is also possible to start the Carousel with empty photos, but we need to hide the no-images-msg
                   this.carousel.start(photo);
                }

             },
             /**
              * @public
              * @description Navigates to the photo. Runs the fullscreen if run has not been called before.
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
             /**
              * @public
              * @description Inserts a new Photo. This will not move the Carousel or do anything else.
              */
             insertPhoto : function (photo) {
                assertTrue(photo instanceof Photo, "input parameter photo has to be instance of Photo");
                assertTrue(this._loaded, "Must call load(photos) before.");
                // Slideshow might or might not be started at that point
                this.carousel.insertPhoto(photo);
             },
             /**
              * @public
              * @description Deletes an existing Photo. If Photo is the current Photo the previous Photo is shown.
              * If there is no previous Photo, nothing is shown.
              */
             deletePhoto : function (photo) {
                assertTrue(photo instanceof Photo, "input parameter photo has to be instance of Photo");
                assertTrue(this._loaded, "Must call load(photos) before.");
                // Slideshow might or might not be started at that point
                this.carousel.deletePhoto(photo);
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
                   this.$title.empty();
                }
             },
             /**
              * @private
              * @description Executed after photo is updated (=displayed)
              */
             _update : function () {
                console.log("FullscreenWidget: _update");
                this._findCurrentPhoto();
                // deleted last photo
                if (this.currentPhoto  === null) {
                   this.$title.empty();
                } else {
                   // right now this is the first time we can update the description
                   // on the other events, beforeLoad & afterLoad, the photo src is not set yet
                   this.$title.text(this.currentPhoto.title);
                }
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
             // /**
             //  * @public
             //  * @description Please add some description here
             //  */
             // update : function (photo) {
             //    var instance = this;
                
             //    //TODO this function is badly designed. The UISlideshow will enable itself and trigger the update event of the UIFullscreen. The UIFullscreen will now update itself. During this time the Fullscreen cannot be loaded, because it is disabled. The UISlideshow must wait till the UIFullscreen is ready before enabling itself, because it is responsible for the UIFullscreen.
             //    console.log("UIFullscreen: update started");
                
             //    // call update() without photo to start the animation (=hide the image and show loading)
             //    if (photo === undefined && instance.visible) {
             //       // image is fading out -> nothing may be updated yet
             //       this.setFadeoutDone(false);
             //       instance.$image.fadeOut(300, function () {
             //          instance.$loader.show();
             //          // image done fading out -> now updating may start
             //          //TODO don't use pub/sub inside a class
             //          instance.setFadeoutDone(true);
             //       });
             //    } else if (photo) {
                   
             //       $("<img/>")
             //          .load(function () {
                         
             //             instance._updateTitle(photo);
                         
             //             if (instance.visible) {
                            
             //                var showImage = function () {
             //                   console.log("Fullscreen: in showImage");
             //                   instance.$loader.hide();
             //                   // change src and fade in after fading out is complete
             //                   window.setTimeout(function () {
             //                      instance.$image.fadeIn(300).attr("src", photo.photo);
             //                   }, 300);
             //                   // enable fullscreen controls again after new image is displayed (and animation is complete)
             //                   window.setTimeout(function () {
             //                      console.log("empty Timeout function");
             //                   }, 600);
             //                };
             //                // check if fading out is already over, if yes start updating
             //                if (instance.fadeoutDone) {
             //                   showImage();
             //                   // if not wait with updating until the fading out is done (=event is triggered) -- the image might be loaded faster than the fading out takes
             //                } else {
             //                   //TODO Don't use pub/sub inside a class
             //                   communicator.subscribeOnce("done:fullscreenImageFadeout", showImage)
             //                }
                            
             //             } else {
             //                instance.$image.attr("src", photo.photo);
             //             }
             //          })
             //          .error(function () {
             //             alert(gettext("PHOTO_LOADING_ERROR"));
             //          })
             //          .attr("src", photo.photo);
             //    }
                
             // },
             // disable : function () {
             //    this.$controls.addClass("mp-disabled");
             //    // needed to indicate ready status to frontend tests
             //    this.$ready.hide();
             //    console.log("UIFullscreen: disabled");
             // },
             // enable : function () {
             //    this.$controls.removeClass("mp-disabled");
             //    // needed to indicate ready status to frontend tests
             //    this.$ready.show();
             //    console.log("UIFullscreen: enabled");
             // },
             _bindListener : function () {
                
                var instance = this;
                this.$navLeft.on("click.Fullscreen", function () {
                   console.log("FullscreenWidget: navigating left");
                   instance.carousel.navigateLeft();
       
                   communicator.publish("navigate:fullscreen", "left");
                });
                this.$navRight.on("click.Fullscreen", function () {
                   console.log("FullscreenWidget: navigating right");
                   instance.carousel.navigateRight();

                   communicator.publish("navigate:fullscreen", "right");

                });
                this.$close.on("click.Fullscreen", function () {
                   console.log("FullscreenWidget: close");
                   instance.hide();

                });
                $("body")
                   .on("keyup.Fullscreen", null, "esc", function () {
                      if (instance.active) {
                         instance.hide();
                      }
                   })
                   .on("keyup.Fullscreen", null, "left", function () {
                      if (instance.active) {
                         instance.carousel.navigateLeft();
                         console.log("FullscreenWidget: navigating left");
                         communicator.publish("navigate:fullscreen", "left");
                      }
                   })
                   .on("keyup.Fullscreen", null, "right", function () {
                      if (instance.active) {
                         instance.carousel.navigateRight();
                         console.log("FullscreenWidget: navigating right");
                         communicator.publish("navigate:fullscreen", "right");
                      }
                   });
             }
          });
       });


