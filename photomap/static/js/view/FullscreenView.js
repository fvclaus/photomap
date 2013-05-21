/*jslint */
/*global $, main, window, Image, UI, assert, gettext */

"use strict";

/**
 * @author Marc Roemer
 * @description Displays current slideshow-image as fullscreen, supports zooming into the image
 */

define(["dojo/_base/declare", "view/View", "presenter/FullscreenPresenter", "model/Photo", "util/Communicator", "ui/UIState", "dojo/domReady!"], 
   function (declare, View, FullscreenPresenter, Photo, communicator, state) {
      return declare(View, {
         constructor : function () {

            this.presenter = new FullscreenPresenter(this);
            this.viewName = "Fullscreen";

            this.iconHelpCount = 5;
            this.$container = $("#mp-fullscreen");
            this.$inner = $("#mp-fullscreen-main");      
            this.$navLeft = $("#mp-fullscreen-nav-prev");
            this.$navRight = $("#mp-fullscreen-nav-next");
            this.$close = $("#mp-fullscreen-close");
            this.$controls = $()
               .add(this.$navLeft)
               .add(this.$navRight)
               .add(this.$close);
         
            assert(this.$controls.size(), 3, "there have to be 3 controls");
         
            this.$title = $("#mp-fullscreen-title");
            this.$imageWrapper = $("#mp-fullscreen-image-wrapper");
            this.$image = $("#mp-fullscreen-image");
            this.$description = $("#mp-fullscreen-image-description");
            this.$zoom = $(".mp-image-zoom");
            this.$loader = $(".mp-dark-loader");
            // need to indicate ready status to frontend tests
            this.$ready = $("<div id=mp-fullscreen-ready />")
               .hide()
            // don't append to container. we need to signal readiness even when the UIFullscreen is not open yet.
               .appendTo($("body"));
            
            this.visible = false;
            this.disabled = true;
            
            this._bindActivationListener(this.$container, this.viewName);
         },
         init : function () {
            
            this._bindListener();
         },
         open : function () {
            
            this.$container.show();
            this.visible = true;
            // fullscreen is just active if mouse is moved or fullscreen is focused (needed for keyboard events)
            this.$container.focus();
            
         },
         close : function () {
            
            this.$container.hide();
            this.$ready.hide();
      
            this.visible = false;
         },
         /**
          * @public
          * @description Please add some description here
          */
         update : function (photo) {
            var instance = this;
            
            //TODO this function is badly designed. The UISlideshow will enable itself and trigger the update event of the UIFullscreen. The UIFullscreen will now update itself. During this time the Fullscreen cannot be loaded, because it is disabled. The UISlideshow must wait till the UIFullscreen is ready before enabling itself, because it is responsible for the UIFullscreen.
            if (!this.disabled) {
               communicator.publish("disable:fullscreen");
            }
            console.log("UIFullscreen: update started");
            
            // call update() without photo to start the animation (=hide the image and show loading)
            if (photo === undefined && instance.visible) {
               // image is fading out -> nothing may be updated yet
               this.setFadeoutDone(false);
               instance.$image.fadeOut(300, function () {
                  instance.$loader.show();
                  // image done fading out -> now updating may start
                  communicator.publish("done:fullscreenImageFadeout");
               });
            } else if (photo) {
               
               $("<img/>")
                  .load(function () {
                  
                     instance._updateTitle(photo);
                     
                     if (instance.visible) {
                        
                        var showImage = function () {
                           console.log("Fullscreen: in showImage");
                           instance.$loader.hide();
                           // change src and fade in after fading out is complete
                           window.setTimeout(function () {
                              instance.$image.fadeIn(300).attr("src", photo.photo);
                           }, 300);
                           // enable fullscreen controls again after new image is displayed (and animation is complete)
                           window.setTimeout(function () {
                              communicator.publish("enable:fullscreen");
                           }, 600);
                        }
                        // check if fading out is already over, if yes start updating
                        if (instance.fadeoutDone) {
                           showImage();
                        // if not wait with updating until the fading out is done (=event is triggered) -- the image might be loaded faster than the fading out takes
                        } else {
                           communicator.subscribeOnce("done:fullscreenImageFadeout", showImage)
                        }
                        
                     } else {
                        instance.$image.attr("src", photo.photo);
                        communicator.publish("enable:fullscreen");
                     }
                  })
                  .error(function () {
                     alert(gettext("PHOTO_LOADING_ERROR"));
                  })
                  .attr("src", photo.photo);
            }
      
         },
         disable : function () {
            this.$controls.addClass("mp-disabled");
            // needed to indicate ready status to frontend tests
            this.$ready.hide();
            console.log("UIFullscreen: disabled");
         },
         enable : function () {
            this.$controls.removeClass("mp-disabled");
            // needed to indicate ready status to frontend tests
            this.$ready.show();
            console.log("UIFullscreen: enabled");
         },
         setFadeoutDone : function (done) {
            this.fadeoutDone = done;
         },
         _bindListener : function () {
            
            var instance = this;
            this.$navLeft.on("click.Fullscreen", function () {
               if (!instance.disabled) {
                  console.log("UIFullscreen: navigating left");
                  instance.presenter.navigate("left");
               }
            });
            this.$navRight.on("click.Fullscreen", function () {
               if (!instance.disabled) {
                  console.log("UIFullscreen: navigating right");
                  instance.presenter.navigate("right");
               }
            });
            this.$close.on("click.Fullscreen", function () {
               if (!instance.disabled) {
                  console.log("UIFullscreen: close");
                  assert(instance.disabled, false, "closing button must not be disabled");
                  instance.presenter.close();
               }
            });
            $("body")
               .on("keyup.Fullscreen", null, "esc", function () {
                  if (!instance.disabled && instance.active) {
                     instance.presenter.close();
                  }
               })
               .on("keyup.Fullscreen", null, "left", function () {
                  if (!instance.disabled && instance.active) {
                     console.log("UIFullscreen: navigating left");
                     instance.presenter.navigate("left");
                  }
               })
               .on("keyup.Fullscreen", null, "right", function () {
                  if (!instance.disabled && instance.active) {
                     console.log("UIFullscreen: navigating right");
                     instance.presenter.navigate("right");
                  }
               });
      
         },
         _updateTitle : function (photo) {
            
            $("#mp-fullscreen-title").text(photo.title);
         }
      })
   });


