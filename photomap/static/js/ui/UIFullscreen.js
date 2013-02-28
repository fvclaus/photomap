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

   assert(this.$controls.size(), 3);

   this.$title = $("#mp-fullscreen-title");
   this.$imageWrapper = $("#mp-fullscreen-image-wrapper");
   this.$image = $("#mp-fullscreen-image");
   this.$description = $("#mp-fullscreen-image-description");
   this.$zoom = $(".mp-image-zoom");
   this.$load = $(".mp-dark-loader");
   // need to indicate ready status to frontend tests
   this.$ready = $("<div id=mp-fullscreen-ready />")
      .hide()
      .appendTo(this.$container);
   
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
      this.$ready.show();
      
      if (this.disabled && !this.updating) {
         this.enable();
      }
      
      this.visible = true;
   },
   close : function () {
      
      this.$container.hide();
      this.$ready.hide();

      this.visible = false;
   },
   update : function () {
      
      console.log("UIFullscreen: update started");
      var ui = main.getUI(),
         state = ui.getState(),
         description = ui.getInformation(),
         photo = state.getCurrentLoadedPhoto(),
         instance = this;
      
      this.disable();
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
                  instance.enable();
                  instance.updating = false;
               }, 600);
               
            } else {
               instance.$image.attr("src", photo.photo);
               instance.enable();
               instance.updating = false;
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
         console.log("UIFullscreen: navigating left");
         assert(instance.disabled, false);

         // we need to disable it here, because the update coming from the slideshow might take awhile
         instance.disable();
         instance.slideshow.navigateLeft();
      });
      this.$navRight.on("click.Fullscreen", function () {
         console.log("UIFullscreen: navigating right");
         assert(instance.disabled, false);

         // we need to disable it here, because the update coming from the slideshow might take awhile
         instance.disable();
         instance.slideshow.navigateRight();
      });
      this.$close.on("click.Fullscreen", function () {
         console.log("UIFullscreen: close");
         assert(instance.disabled, false);

         instance.close();
      });

   },
   _updateTitle : function (photo) {
      
      $("#mp-fullscreen-title").text(photo.title);
      //$("#mp-fullscreen-image-description").text(photo.description);
   }
};


