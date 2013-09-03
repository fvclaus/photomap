/*jslint */
/*global $, define, main, window, assert, assertTrue, assertString, assertObject */

"use strict";

/**
 * @author Marc-Leon Römer
 * @class provides basic effects for switching images in carousels
 */

define(["dojo/_base/declare",
        "../util/Tools"], 
       function (declare, tools) {
          return declare(null, {
             FADE : 0,
             FLIP : 1,
             constructor : function () {
                
                this.defaults = {
                   items : $(),
                   photos : null,
                   srcPropertyName : null,
                   loader : $(),
                   animation: "fade",
                   animationTime: 200,
                   complete : function () {},
                   context: null
                };
             },
             start : function (options) {
                assertObject(options, "Parameter options is not optional.");
                assertObject(options.items, "Must provide items to animate.");
                this._animate(options, "start");

             },
             end : function (options) {
                assertObject(options, "Parameter options is not optional.");
                assertObject(options.items, "Must provide items to animate.");
                assertTrue(options.photos && options.photos.forEach, "Photos Array must provide forEach function.");
                assertString(options.srcPropertyName, "Must provide srcPropertyName attribute.");
                assertTrue(options.items.length === options.photos.length, "Parameter photos and items must have the same length.");

                this._animate(options, "end");
             },
             /**
              * @public
              * @description Destroys this instance, rendering it useless.
              */
             destroy : function () {
                this.defaults = null;
             },
             /**
              * @private
              */
             _animate : function (options, time) {
                assertTrue(options.items, "CarouselEffects doesn't know which items to animate");
                console.log("CarouselAnimation: _animate");
                
                options = $.extend({}, this.defaults, options);

                var scaleX = function ($element, value) {
                   var scaleValue = "scaleX(" + value + ")";
                   $element.css({
                      "-o-transform": scaleValue,
                      "-webkit-transform": scaleValue,
                      "transform": scaleValue
                   });
                },
                    instance = this;
                //TODO Where is matrix used?
                    // matrix = function (value) {
                    //    return "matrix(" + value + ")";
                    // };

                
                // Convert the animation type to an integer to make the comparison faster.
                if (options.animation === "fade") {
                   this.animation = this.FADE;
                   console.log("CarouselAnimation: fading...");
                } else if (options.animation === "flip") {
                   this.animation = this.FLIP;
                   console.log("CarouselAnimation: flipping...");
                } else {
                   assertTrue(false, "Animation has to be one of flip or fade.");
                }

                if (this.animation === this.FLIP) {
                   // Sets transition property browser-independently.
                   options.items.addClass("mp-animate-" + options.animationTime);
                }

                if (time === "start") {
                   this.lastAnimation = this.animation;
                   options.items.show();

                   // The complete event for fadeOut will get fired everytime a photo element is faded out.
                   // There is no event for scaling,
                   if (this.animation === this.FADE) {
                      // Fadout items in animationTime microseconds.
                      options.items.fadeOut(options.animationTime);
                   } else {
                      // This needs a little time to catch up.
                      setTimeout(function() {
                         scaleX(options.items, 0);
                      }, 100);
                   }
                   // Therefore the other code has to be moved into a timeout.
                   // This thread might be executed after the instance has been destroyed.
                   setTimeout(function () {
                      try {
                         //TODO this is an hack to always execute the complete callback that is needed by PhotoCarouselWidget.
                         if (!instance._isDestroyed()) {
                            options.items.hide();
                            // Show the loading handler and
                            options.loader.show();
                            // Call the complete callback.
                         }
                         // Never skip the start complete event.
                         // The complete event starts the load handler for photos.
                         options.complete.call(options.context, options.items);
                      } catch (e) {
                         console.log("CarouselAnimation: This instance has been destroyed. Aborting.");
                         console.dir(e);
                      }
                   }, options.animationTime + 200); // Fadeout animations take a little longer than the specified animationTime.
                } else if (time === "end") {
                   assertTrue(this.lastAnimation === this.animation, "Can only finish an animation, if the animation was started with the same animation type.");
                   options.loader.hide();
                   // flip does not work properly, if the photos are still hidden.
                   if (this.animation === this.FLIP) {
                      options.items.show()
                         // .css("display", "block")
                         // .css("visibility" , "visible")
                      // Reset the transformation.
                         .removeClass("mp-animate-" + options.animationTime)
                         .css({
                            "-webkit-transform" : "",
                            "transform" : "",
                            "-o-transform" : ""});
                   }

                   options.photos.forEach(function (photo, index) {
                      var $photo = options.items.eq(index),
                          photoSource = null;
                      if (photo) {
                         photoSource = photo.getSource(options.srcPropertyName);
                      }

                      // Give the element its later dimensions.
                      $photo.attr("src", photoSource);
                      console.log("CarouselAnimation: Setting src %s on photo thumb %d.", photoSource, index);
                      tools.centerElement($photo, "vertical");
                      // Remove the img again to fade it in nicely.
                      $photo.removeAttr("src");
                      if (photoSource) {
                         $photo.attr("src", photoSource);
                         if (instance.animation === instance.FADE) {
                            $photo.hide().fadeIn(options.animationTime);
                         } else {
                            // Scale it to 0 first to scale it to 1 later.
                            // This should happen instantly without delay.
                            scaleX($photo, 0);
                            // Transform needs little time to 'catch up'.
                            setTimeout(function () {
                               $photo.addClass("mp-animate-" + options.animationTime);
                               scaleX($photo, 1);
                            } , 100);
                         }
                      } else {
                         $photo
                            .hide()
                            .removeAttr("src");
                      }
                   });
                   // This thread might be executed after its instance has been destroyed.
                   window.setTimeout(function () {
                      try { 
                         instance._ping();
                         options.complete.call(options.context, options.items);
                      } catch (e) {
                         console.log("CarouselAnimation: This instance has been destroyed. Aborting.");
                         console.dir(e);
                      }
                   }, options.animationTime + 200);

                } else {
                   assertTrue(false, "Time has to be one of start or end.");
                }
             },
             _isDestroyed : function () {
                return this.defaults === null;
             },
             /**
              * @private
              * @description Raises an error, if this instance has been destroyed.
              */
             _ping : function () {
               var a = this.defaults.items * 2;
             }
          });
       });
