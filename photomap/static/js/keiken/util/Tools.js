/*jslint */
/*global $, main, B, define, assert, assertTrue */

"use strict";

/**
 * @author Marc-Leon Römer
 * @class contains all basic helper functions.
 */

define(["dojo/_base/declare"],
   function (declare) {
      var Tools = declare(null, {
         constructor : function () {},
         /**
          * @description Js-modulo does not work if the first number is negative (eg. -5%4 = -1 | instead of 3)
          * You can fix that bug by adding the second number and do a modulo calculation again.
          */
         modulo : function (x, y) {
            return ((x % y) + y) % y;
         },
         countAttributes : function (object) {
            var count = 0,
                key = null;
            for (key in object) {
               if (object.hasOwnProperty(key)) {
                  count++;
               }
            }
            return count;
         },
         cutText : function (text, size) {
      
            if (text === null){
               return text;
            }
            
            var createSubstring, endingPunctuation, i, substring;
            endingPunctuation = [".", "!", "?", ";", ":"];
            
            createSubstring = function (text, size, end) {
               
               var string, index, currentChar;
               string = null;
               size -= 25;
               for (i = 0; i < 50; i++) {
               
                  index = size + i;
                  currentChar = text.charAt(index);
                  if ($.inArray(currentChar, end) >= 0) {
                     
                     string = text.substring(0, index + 1);
                  }
               }
               return string;
            };
            
            if (text.length > size) {
               substring = createSubstring(text, size, endingPunctuation);
               if (substring === null) {
                  substring = createSubstring(text, size, [" ", ","]);
               }
            } else if (text.length <= size) {
               substring = text;
            }
            
            return substring;
         },
         /**
          * @description centers element in parent frame - both horizontal and vertical is possible - default centers element vertically and horizontally
          * @param $parent {jQuery-Object} parent frame
          * @param $element {jQuery-Object} element that is supposed to be centered
          * @param direction {String} defines in which direction the element should be centered - can be "vertical", "horizontal" or empty
          */
         centerElement : function ($element, direction) {
            assertTrue(direction === "vertical" || direction === "horizontal", "direction has to be either vertical or horizontal");
      
            var margin = 0, 
                $parent = $element.parent(),
                heightDifference = $parent.height() - $element.height(),
                widthDifference = $parent.width() - $element.width();
            
            switch (direction) {
            
            case "vertical":
               if (heightDifference > 0){
                  // this is better than setting margin top and bottom
                  // margin top and bottom in combination with overflow : auto will often display vertical scrollbars
                  $element.css("margin-top", heightDifference / 2 + "px");
               } else {
                  $element.css("margin-top", "0px");
               }
               break;
            case "horizontal":
               //TODO this needs a rework
               assertTrue(widthDifference > 0, "widthDifference must not be negative or zero");
               margin = "0px ";
               if (widthDifference <= 0) {
                  margin += 0;
               } else {
                  margin += widthDifference / 2;
               }
               margin += "px";
               $element.css("margin", margin);
               break;
            default:
               //TODO this also needs to be redone
               if (heightDifference <= 0) {
                  margin = 0;
               } else {
                  margin = heightDifference / 2;
               }
               margin += "px ";
               if (widthDifference <= 0) {
                  margin += 0;
               } else {
                  margin += widthDifference / 2;
               }
               margin += "px";
               $element.css("margin", margin);
               break;
            }
         },
         /**
          * @param Array
          * @description return first key with undefined value
          */
         firstUndef : function (array) {
      
            var i, index;
      
            index = -1;
            for (i = 0; i <= array.length; i++) {
               if (array[i] === null) {
                  return i;
               }
            }
            return -1;
         },
         /**
          * Array Remove - By John Resig (MIT Licensed)
          *
          * Usage: arrayRemove(array, 1) -> remove second item; arrayRemove(array, -2) -> remove second to last; arrayRemove(array, 1, 2) -> remove second and third
          */
         arrayRemove : function (array, from, to) {
            var rest = array.slice((to || from) + 1 || array.length);
            array.length = from < 0 ? array.length + from : from;
            return array.push.apply(array, rest);
         },
         calculateFontSize : function (title, desiredWidth, desiredHeight) {
            
            var $fontEl, size = 1;
            
            $fontEl =
               $("<span></span>")
               .text(title)
               .appendTo($("body"))
               .css("fontSize", size + "px");
            do {
               $fontEl.css("fontSize", (size++) + ("px"));
            } while ($fontEl.height() < desiredHeight && $fontEl.width() < desiredWidth);
            $fontEl.remove();
            return size - 1;
         },
         getRealHeight : function ($el) {
            return $el.height() +
               this.getCss2Int($el, [
                  "border-bottom-width",
                  "border-top-width",
                  "margin-bottom",
                  "margin-top"
               ]);
         },
         getRealWidth : function ($el) {
            return $el.width() +
               this.getCss2Int($el, [
                  "border-left-width",
                  "border-right-width",
                  "margin-left",
                  "margin-right"
               ]);
         },
         getCss2Int : function ($el, attributes) {
            
            var value, total;
            
            if (typeof (attributes) === "object") {
               total = 0;
               attributes.forEach(function (attribute) {
                  value = parseInt($el.css(attribute), 10);
                  if (value) {
                     total += value;
                  }
               });
            } else {
               total = parseInt($el.css(attributes), 10);
            }
            return total;
         },
         bytesToMbyte : function (bytesAsString) {
                  
            return (parseFloat(bytesAsString) / Math.pow(2, 20)).toFixed(1).toString();
         },
         /*
          * @private
          */
         _getUrlParameter : function (name) {
            
            var regexS, regex, results, param;
            
            name = name.replace("/[]/", "\\").replace("/[]/", "\\");
            regexS = "[\\?&]" + name + "=([^&#]*)";
            regex = new RegExp(regexS);
            results = regex.exec(window.location.search);
            if (results === null) {
               param = null;
            } else {
               param = decodeURIComponent(results[1].replace(/\+/g, " "));
            }
            return param;
         },
      
         getUrlId : function () {
            return this._getUrlParameter("id");
         },
      
         /**
          * @description get the last object with specified key-value-pair in any array of objects
          */
         getObjectByKey : function (key, value, array) {
            
            var result = null;
            
            array.forEach(function (object, index) {
               if (object[key] === value) {
                  result = object;
               }
            });
            
            return result;
         },
         fitMask : function () {
            
            // fit mask of tools-expose between header and footer
            $("#exposeMask").css({
               'max-height': $('#mp-content').innerHeight(),
               'max-width': $('#mp-content').innerWidth(),
               'top': $('#mp-content').offset().top,
               'left': $('#mp-content').offset().left,
               'z-index': 1000
            });
         },
      
         loadOverlay : function ($overlay, modal) {
            $overlay
               .overlay({
                  top: "center",
                  mask: {
                     color: "#dadada",
                     loadSpeed: 200,
                     opacity: 0.7
                  },
                  closeOnClick: !modal,
                  load: true
               })
               .load();
         },
         closeOverlay : function ($overlay) {
            $overlay.data("overlay").close();
         },
         setCursor : function ($element, style) {
            $element.css('cursor', style);
         }
      }),
      
      _instance = new Tools();
      return _instance;
   });
