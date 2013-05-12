/*jslint */
/*global $, define, main, window, assert, assertTrue, assertString */

"use strict";

/**
 * @author Marc-Leon Römer
 * @class provides basic effects for switching images in carousels
 */

define(["dojo/_base/declare", "util/Tools"], 
       function (declare, tools) {
          var CarouselEffects = declare(null, {
             constructor : function () {
                
                this.defaults = {
                   items : null,
                   images : null,
                   loader : null,
                   animation: "fade",
                   animationTime: 200,
                   onStart: null,
                   onEnd: null,
                   context: null
                }
             },
             start : function (options) {
                this.animate(options, "start");
             },
             end : function (options) {
                this.animate(options, "end");
             },
             animate : function (options, time) {
                assertTrue(options.items, "CarouselEffects doesn't know which items to animate");
                console.log("CarouselAnimation: in animate");
                
                options = $.extend({}, this.defaults, options);
                
                switch (options.animation) {
                   case "fade":
                     this._fade(options, time);
                     break;
                   case "flip":
                     this._flip(options, time);
                     break;
                   default:
                     this._fade(options, time);
                     break; 
                }
             },
             _fade : function (options, time) {
                
                //begin animation
                if (time === "start") {
                  options.items.fadeOut(options.animationTime);
                  window.setTimeout(
                     function () {
                        if (options.loader) {
                           options.loader.show();
                        }
                        if (options.onStart) {
                           options.onStart.call(options.context, options.items);
                        }
                     },
                     options.animationTime
                  );
                // end animation
                } else if (time === "end") {
                   
                   if (options.loader) {
                      options.loader.hide();
                   }
                   $.each(options.items, function (index, item) {
                      var imageSource = options.images[index];
                      // center element
                      // give the element its later height
                      $(item)
                           .css("visibility", "hidden")
                           .attr("src", imageSource);
                      // set margin-top accordingly. 
                      tools.centerElement($(item), "vertical");
                      // remove the img again to fade it in nicely
                      $(item)
                           .removeAttr("src")
                           .css("visibility", "visible");
                      if ( imageSource !== null) {
                         $(this).fadeIn(options.animationTime)
                            .attr("src", imageSource)
                            // needed for frontend testing to select 'active' photos
                            .addClass("mp-test-photo-used");

                      } else {
                         $(this).fadeOut(0, updated)
                            .removeAttr("src")
                            // needed for frontend testing to select 'active' photos
                            .removeClass("mp-test-photo-used");
                      }
                   });
                   
                   window.setTimeout(
                      function () {
                         if (options.onEnd) {
                            options.onEnd.call(options.context, options.items)
                         }
                      },
                      options.animationTime
                   );
                }
             },
             _flip : function (options, time) {
                
                console.log("CarouselAnimation: in flip");
                var scaleX = function (value) {
                   return "scaleX(" + value + ")";
                };
                //begin animation
                if (time === "start") {
                   console.log("CarouselAnimation: stat flipping");
                   // sets transition property browser-independently
                   options.items.addClass("mp-animate-" + options.animationTime);
                   options.items.css({
                      "-o-transform": scaleX(0),
                      "-webkit-transform": scaleX(0),
                      "transform": scaleX(0)
                   });
                   window.setTimeout(
                     function () {
                        options.items.hide();
                        if (options.loader) {
                           options.loader.show();
                        }
                        if (options.onStart) {
                           options.onStart.call(options.context, options.items);
                        }
                     },
                     options.animationTime
                  );
                // end animation
                } else if (time === "end") {
                   console.log("CarouselAnimation: end flipping");
                   
                   if (options.loader) {
                      options.loader.hide();
                   }
                   $.each(options.items, function (index, item) {
                      var imageSource = options.images[index];
                      // center element
                      // give the element its later height
                      $(item)
                           .css("visibility", "hidden")
                           .show()
                           .attr("src", imageSource);
                      // set margin-top accordingly. 
                      tools.centerElement($(item), "vertical");
                      // remove the img again to fade it in nicely
                      $(item)
                           .removeAttr("src")
                           .css("visibility", "visible");
                      if ( imageSource !== null) {
                         
                         $(item)
                            .attr("src", imageSource)
                            .css({
                               "-o-transform": scaleX(1),
                               "-webkit-transform": scaleX(1),
                               "transform": scaleX(1)
                            })
                            // needed for frontend testing to select 'active' photos
                            .addClass("mp-test-photo-used");

                      } else {
                         $(item).fadeOut(0, updated)
                            .removeAttr("src")
                            // needed for frontend testing to select 'active' photos
                            .removeClass("mp-test-photo-used");
                      }
                   });
                   
                   window.setTimeout(
                      function () {
                         if (options.onEnd) {
                            options.onEnd.call(options.context, options.items)
                         }
                      },
                      options.animationTime
                   );
                }
             },
          }),
          _instance = new CarouselEffects();
          return _instance;
       });
