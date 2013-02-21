/*jslint */
/*global $, main, window, Image, UI, assert */

"use strict";

/**
 * @author Marc Roemer
 * @description Displays current slideshow-image as fullscreen, supports zooming into the image
 */

var UIFullscreen;

UIFullscreen = function (slideshow) {
   
   this.slideshow = slideshow;
   
   this.iconHelpCount = 5;
/*   this.$fullscreen = null;
   this.$close = null;
   this.$name = null;
   this.$image = null;
   this.$zoom = null;
   this.$load = null;
   this.$wrapper = null;
 */
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
   
   this.visible = false;
   this.started = false;
   this.zoomInitialized = false;
   this.disabled = true;
};

UIFullscreen.prototype = {
   
   init : function () {
      
      this._bindListener();
   },
   start : function () {
      assert(this.started, false);

      var instance = this,
         state = main.getUIState();
       
      this.disable();
      this.$container.show();
      
      this.$imageWrapper.css({
         width: instance.$imageWrapper.width() + "px",
         height: instance.$imageWrapper.height() + "px"
      });
      this.$inner.css("visibility", "hidden");
//      this.$image.addClass("mp-fixed-position");
      this.$image.on("drag", function () {
         if (instance.$image.hasClass("mp-fixed-position")) {
            instance.$image.removeClass("mp-fixed-position");
         }
      });
      this.$image.addClass("mp-fullscreen-image");
      this.$imageWrapper.tzoom({
         image: instance.$image,
         imageSrc: state.getCurrentLoadedPhoto().photo,
         loadingImage: instance.$load,
         fixed: true,
         wheelStep: 5, //default is 15
         onZoom: function (zoomlevel) {
            $(this).removeClass("mp-fullscreen-image");
            if (zoomlevel !== 0) {
               if (!$(this).hasClass("mp-fixed-position") && $(this).width() < instance.$imageWrapper.width()) {
                  $(this).addClass("mp-fixed-position");
               } else if ($(this).hasClass("mp-fixed-position") && $(this).width() > instance.$imageWrapper.width()) {
                  $(this).removeClass("mp-fixed-position");
               }
            } else {
               if (!$(this).hasClass("mp-fixed-position")) {
                  $(this).addClass("mp-fixed-position");
               }
            }
         },
         onZoomed : function (zoomlevel) {
            if (zoomlevel !== 0) {
               if (!$(this).hasClass("mp-fixed-position") && $(this).width() < instance.$imageWrapper.width()) {
                  $(this).addClass("mp-fixed-position");
               } else if ($(this).hasClass("mp-fixed-position") && $(this).width() > instance.$imageWrapper.width()) {
                  $(this).removeClass("mp-fixed-position");
               }
            } else {
               if (!$(this).hasClass("mp-fullscreen-image")) {
                  $(this).addClass("mp-fullscreen-image");
               }
            }
         },
         onReady: function () {
            state.setFullscreen(true);
            instance.$image.css({
               top: 0,
               left: 0
            });
            instance.$inner.css("visibility", "visible");
            instance.enable();
         }
      });
      this.started = true;
      this.$imageWrapper.tzoom("enable");
   },
   open : function () {
      
      var instance = this,
         state = main.getUIState();
      
      if (!this.started) {
         this.start();
      } else {
         this.$container.show();
         this.$imageWrapper.tzoom("imageSrc", state.getCurrentLoadedPhoto().photo);
         this.$imageWrapper.tzoom("enable");
      }
      this.visible = true;
   },
   close : function () {
      
      this.$container.hide();
      this.$imageWrapper.tzoom("disable");
      this.visible = false;
   },
   update : function () {
      
      var ui = main.getUI(),
         state = ui.getState(),
         description = ui.getInformation(),
         photo = state.getCurrentLoadedPhoto(),
         instance = this;
      
      this._updateTitle(photo);
      
      if (this.visible) {
         
         this.disable();
         this.$image.fadeOut(300);
         // change src and fade in after fading out is complete
         window.setTimeout(function () {
            instance.$image.fadeIn(300).attr("src", photo.photo);
         }, 300);
         // enable fullscreen controls again after new image is displayed (and animation is complete)
         window.setTimeout(function () {
            instance.enable();
         }, 600);

      } else {
         this.$image.attr("src", photo.photo);
      }
   },
   disable : function () {
      this.disabled = true;
      this.$controls.addClass("mp-disabled");
      console.log("UIFullscreen: disabled");
      // this.$navLeft.off(".Fullscreen");
      // this.$navRight.off(".Fullscreen");
      // this.$close.off(".Fullscreen");
   },
   enable : function () {
      this.disabled = false;
      this.$controls.removeClass("mp-disabled");
      console.log("UIFullscreen: enabled");
      // this._bindListener();
   },
   /**
    * @public
    * @description This is used by the frontend test to 'wait' for the fullscreen to become enabled again
    */
   isDisabled : function () {
      return this.disabled;
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
   },
      
/*
   // displays zoomed version of current image as overlay
	//TODO this method is way too long
   zoom : function () {
      var data, $mpContainer, instance	= this;
      $mpContainer = $(".mp-container");
      //disable if clause because it works only once
      // if( !this.$fullscreenEl ) {
      data	= {
         source	: main.getUIState().getCurrentLoadedPhoto().photo,
         description	: main.getUIState().getCurrentLoadedPhoto().title
      };
      $mpContainer.append($.jqote('#galleryFullscreenTmpl', {tmplPhotoData : data}));

      this.$fullscreen = $('#mp-image-overlay');
      this.$close = this.$fullscreen.find('img.mp-image-overlay-close');
      this.$name = this.$fullscreen.find('h2.mp-label');
      this.$image = this.$fullscreen.children("img.mp-image-full");
      this.$zoom = this.$fullscreen.find("img.mp-image-zoom");
      this.$load = this.$fullscreen.find("img.mp-dark-loader");

      this._bindListener();
      $('<img/>').load(function () {
         css = instance._resizeImage(instance.$image);
         // instance.$image.show();

         //shortcut
         var border, innerWrapper, img = instance.$image;

         //copy properties from img to wrap img for tzoom library
         instance.$wrapper =
            $("<div/>")
            .addClass("mp-image-overlay-wrapper")
            .css("margin-left", css["margin-left"])
            .css("margin-top", css["margin-top"])
            .css("overflow", "hidden")
            .css("cursor", "auto")
            .width(css.width)
            .height(css.height);
               // .width($("#mp-map") * 0.25) 
               // .height($("#mp-map") * 0.25);

         innerWrapper =
            $("<div/>")
               .css("width", css.width)
               .css("height", css.height);
         img.css("margin", "0px 0px");
         innerWrapper.append(img);
         instance.$wrapper.append(innerWrapper);


         //hide border during fadein
         instance.$wrapper.css("border", "0px");

         innerWrapper.tzoom({
            image: img,
            onReady : function () {
               main.getUIState().setFullscreen(true);
               //img is still positioned in the "middle".
               instance.$image.css({
                  "top": 0,
                  "left": 0
               });
               innerWrapper.css({
                  "top": 0,
                  "left": 0
               });
               //show border when the image is ready
               instance.$wrapper.css("border", "3px solid white");
               instance.$image.show();
               instance.$load.hide();
            }
         });

         $(".mp-image-overlay").append(instance.$wrapper);

      }).attr('src', main.getUIState().getCurrentLoadedPhoto().photo);
   },
      */
   /**
    * @private
    *  adjust height and weight properties of image so that it fits current window size
    */
   /*
   _resizeImage : function ($image) {
      
      var widthMargin, heightMargin, windowH, windowW, theImage, imgwidth, imgheight, newwidth, newnewwidth, newheight, newnewheight, ratio, newratio;
      
      widthMargin = 50;
      heightMargin = 2 * this.$name.height();

      windowH = $(window).height() - heightMargin;
      windowW = $(window).width() - widthMargin;
      theImage = new Image();

      theImage.src = $image.attr("src");

      imgwidth = theImage.width;
      imgheight = theImage.height;

      if ((imgwidth > windowW) || (imgheight > windowH)) {

         if (imgwidth > imgheight) {
            
            newwidth = windowW;
            ratio = imgwidth / windowW;
            newheight = imgheight / ratio;

            theImage.height = newheight;
            theImage.width = newwidth;

            if (newheight > windowH) {
               newnewheight = windowH;
               newratio = newheight / windowH;
               newnewwidth = newwidth / newratio;
               theImage.width = newnewwidth;
               theImage.height = newnewheight;
            }
         } else {
            newheight = windowH;
            ratio = imgheight / windowH;
            newwidth = imgwidth / ratio;
            theImage.height = newheight;
            theImage.width = newwidth;

            if (newwidth > windowW) {
               newnewwidth = windowW;
               newratio = newwidth / windowW;
               newnewheight = newheight / newratio;
               theImage.height = newnewheight;
               theImage.width = newnewwidth;
            }
         }
      }

      css = {
         'width' : theImage.width + 'px',
         'height' : theImage.height + 'px',
         'margin-left' : -theImage.width / 2 + 'px',
         'margin-top' : -theImage.height / 2 + this.$name.height() / 2 + 'px'
      };

      $image.css(css);

      return css;
   },
      */
   /**
    * @private
    * bind hide functionality to close button
    */
   /*
   _bindListener : function () {
      var instance = this;
      $("div.mp-image-nav")
         .off(".Fullscreen")
         .on("click.Fullscreen", "img.mp-image-nav-next", function (event) {
            instance.$close.trigger("click");
            instance.slideshow.navigateRight();
            instance.zoom();
         })
         .on("click.Fullscreen", "img.mp-image-nav-prev", function (event) {
            instance.$close.trigger("click");
            instance.slideshow.lideshow.navigateLeft();
            instance.zoom();
         });
      this.$close.off(".Fullscreen").on('click.Fullscreen', function () {
         //remove since it will be recreated with every call to gallery.zoom()
         main.getUIState().setFullscreen(false);
         instance.$fullscreen.fadeOut("slow").remove();
      });
      this.$image.bind("mouseover.Gallery", function () {
         
         var $wrapper, position, lowOpacity, highOpacity, duration;
         
         //TODO there needs to be a better way of pointing out the zoom feature
         if (main.getUIState().isFullscreen() && instance.iconHelpCount > 0) {
            // instance.iconHelpCount -= 1;
            // $wrapper = instance.$wrapper;
            // position = {
            //    left : $wrapper.position().left,
            //    top : $wrapper.position().top
            // };
            // lowOpacity  = {opacity : 0.1};
            // highOpacity = {opacity : 0.8};
            // duration = 1500;
            // //animate blinking
            // instance.$zoom
            //    .css("left", position.left)// - instance.$zoom.width()/2)
            //    .css("top", position.top) // -  instance.$zoom.height()/2)
            //    .css("opacity", 0.1)
            //    .show()
            //    .animate(highOpacity, duration)
            //    .animate(lowOpacity, duration)
            //    .animate(highOpacity, duration)
            //    .animate(lowOpacity, duration, function () {
            //       instance.$zoom.hide();
            //    });
         }
      });
   }
    */
};


