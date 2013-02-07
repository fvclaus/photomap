/*jslint */
/*global $, main, window, Image, UI */

"use strict";

var UIFullscreen, css;
//TODO this class has only 3 methods. All of them are too long
UIFullscreen = function (slideshow) {
   
   this.slideshow = slideshow;
   
   this.iconHelpCount = 5;
   this.$fullscreen = null;
   this.$close = null;
   this.$name = null;
   this.$image = null;
   this.$zoom = null;
   this.$load = null;
   this.$wrapper = null;

};

UIFullscreen.prototype = {

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

   /**
    * @private
    *  adjust height and weight properties of image so that it fits current window size
    */
/*   _resizeImage : function ($image) {
      
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
};


