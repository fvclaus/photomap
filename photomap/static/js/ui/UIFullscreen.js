/*jslint */
/*global $, main, window, Image, UI, assert, gettext */

"use strict";

/**
 * @author Marc Roemer
 * @description Displays current slideshow-image as fullscreen, supports zooming into the image
 */

var UIFullscreen;

UIFullscreen = function (slideshow) {
   
   this.slideshow = slideshow;
   
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
   this.$load = $(".mp-dark-loader");
   // need to indicate ready status to frontend tests
   this.$ready = $("<div id=mp-fullscreen-ready />")
      .hide()
   // don't append to container. we need to signal readiness even when the UIFullscreen is not open yet.
      .appendTo($("body"));
   
   this.visible = false;
   this.updating = false;
   this.disabled = true;
};

UIFullscreen.prototype = {
   
   init : function () {
      
      this._bindListener();
   },
   open : function () {
      
      this.$container.show();
      this.visible = true;
      
      //TODO should be enabled by the same function that disabled it in the first place
      // if (this.disabled && !this.updating) {

         // this.enable();
      // }
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
   update : function () {
      //TODO this function is badly designed. The UISlideshow will enable itself and trigger the update event of the UIFullscreen. The UIFullscreen will now update itself. During this time the Fullscreen cannot be loaded, because it is disabled. The UISlideshow must wait till the UIFullscreen is ready before enabling itself, because it is responsible for the UIFullscreen.
      this.disable();      
      console.log("UIFullscreen: update started");
      var ui = main.getUI(),
         state = ui.getState(),
         description = ui.getInformation(),
         photo = state.getCurrentLoadedPhoto(),
         instance = this;

      this.updating = true;

      $("<img/>")
         .load(function () {
         
            instance._updateTitle(photo);
            
            if (instance.visible) {
               
               instance.$image.fadeOut(300);
               // change src and fade in after fading out is complete
               window.setTimeout(function () {
                  instance.$image.fadeIn(300).attr("src", photo.photo);
               }, 300);
               // enable fullscreen controls again after new image is displayed (and animation is complete)
               window.setTimeout(function () {
                  instance.updating = false;
                  instance.enable();
               }, 600);
               
            } else {
               instance.$image.attr("src", photo.photo);
               instance.updating = false;
               instance.enable();
            }
         })
         .error(function () {
            alert(gettext("PHOTO_LOADING_ERROR"));
         })
         .attr("src", photo.photo);
   },
   disable : function () {
      this.disabled = true;
      this.$controls.addClass("mp-disabled");
      // needed to indicate ready status to frontend tests
      this.$ready.hide();
      console.log("UIFullscreen: disabled");
   },
   enable : function () {
      this.disabled = false;
      this.$controls.removeClass("mp-disabled");
      // needed to indicate ready status to frontend tests
      this.$ready.show();
      console.log("UIFullscreen: enabled");
   },
   _bindListener : function () {
      
      var instance = this;
      this.$navLeft.on("click.Fullscreen", function () {
         if (!instance.disabled) {
            console.log("UIFullscreen: navigating left");
            // we need to disable it here, because the update coming from the slideshow might take awhile
            instance.disable();
            instance.slideshow.navigateLeft();
         }
      });
      this.$navRight.on("click.Fullscreen", function () {
         if (!instance.disabled) {
            console.log("UIFullscreen: navigating right");
            // we need to disable it here, because the update coming from the slideshow might take awhile
            instance.disable();
            instance.slideshow.navigateRight();
         }
      });
      this.$close.on("click.Fullscreen", function () {
         if (!instance.disabled) {
            console.log("UIFullscreen: close");
            assert(instance.disabled, false, "closing button must not be disabled");
            instance.close();
         }
      });

   },
   _updateTitle : function (photo) {
      
      $("#mp-fullscreen-title").text(photo.title);
      //$("#mp-fullscreen-image-description").text(photo.description);
   }
};


