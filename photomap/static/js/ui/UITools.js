/*jslint */
/*global $, main */

"use strict";

/**
 * @author Marc-Leon Römer
 * @class contains all basic helper functions.
 */

var UITools;

UITools = function () {
};

UITools.prototype = {

   initWithoutAjax : function () {
      this.fitMask($("#fancybox-overlay"));
   },
   /**
    * @description Js-modulo does not work if the first number is negative (eg. -5%4 = -1 | instead of 3)
    * You can fix that bug by adding the second number and do a modulo calculation again.
    */
   modulo : function (x, y) {
      return ((x % y) + y) % y;
   },
   cutText : function (text, size) {
      
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
      
      if (text !== null && text.length > size) {
         substring = createSubstring(text, size, endingPunctuation);
         if (substring === null) {
            substring = createSubstring(text, size, [" ", ","]);
         }
      } else if (text.length <= size) {
         substring = text;
      } else {
         substring = null;
         alert("The text-string is null.");
      }
      
      return substring;
   },
   
   /**
    * @description centers element in parent frame - both horizontal and vertical is possible - default centers element vertically and horizontally
    * @param $parent {jQuery-Object} parent frame
    * @param $element {jQuery-Object} element that is supposed to be centered
    * @param direction {String} defines in which direction the element should be centered - can be "vertical", "horizontal" or empty
    */
   createMatrix : function (array, columns) {
      
      var matrix, i, j, k;
      i = 0;
      j = 0;
      k = 0;
      matrix = [];
      matrix[0] = [];
      while (i <= columns) {
         matrix[k].push(array[j]);
         if (j === array.length - 1) {
            break;
         }
         if (i === columns - 1) {
            i = 0;
            j++;
            k++;
            matrix[k] = [];
         } else {
            i++;
            j++;
         }
      }
      
      return matrix;
   },
   centerElement : function ($parent, $element, direction) {
      
      var margin, heightDifference, widthDifference;
      
      heightDifference = $parent.height() - $element.height();
      widthDifference = $parent.width() - $element.width();
      
      switch (direction) {
      
      case "vertical":
         if (heightDifference <= 0) {
            margin = 0;
         } else {
            margin = heightDifference / 2;
         }
         margin += "px 0px";
         break;
      case "horizontal":
         margin = "0px ";
         if (widthDifference <= 0) {
            margin = 0;
         } else {
            margin = widthDifference / 2;
         }
         margin += "px";
         break;
      default:
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
         break;
      }
      
      $element.css("margin", margin);
   },
   centerChildren : function ($element, direction) {
      
      var i, padding, $child, $children, childWidth, childHeight;
      
      $children = $element.children();
      childWidth = 0;
      childHeight = 0;
      
      for (i = 0; i < $children.length; i++) {
         $child = $($children[i]);
         childWidth += this.getRealWidth($child);
         childHeight += this.getRealHeight($child);
      }
         
      switch (direction) {
      
      case "vertical":
         padding = ($element.height() - childHeight) / 2;
         padding += "px 0";
         break;
      case "horizontal":
         padding = "0 ";
         padding += ($element.width() - childWidth) / 2;
         padding += "px";
         break;
      default:
         padding = ($element.height() - childHeight) / 2;
         padding += "px ";
         padding += ($element.width() - childWidth) / 2;
         padding += "px";
         break;
      }
      
      $element.css("padding", padding);
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
      if (typeof (attributes) === "object") {
         var value, total = 0;
         attributes.forEach(function (attribute) {
            value = parseInt($el.css(attribute));
            if (value) {
               total += value;
            }
         });
         return total;
      } else {
         return parseInt($el.css(attributes));
      }
   },
   /*
    * @private
    */
   _getUrlParameter : function (name) {
      
      var regexS, regex, results;
      
      name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
      regexS = "[\\?&]" + name + "=([^&#]*)";
      regex = new RegExp(regexS);
      results = regex.exec(window.location.search);
      if (results === null) {
         return null;
      } else {
         return decodeURIComponent(results[1].replace(/\+/g, " "));
      }
   },

   getUrlId : function () {
      return this._getUrlParameter("id");
   },

   getUrlSecret : function () {
      return this._getUrlParameter("secret");
   },

   deleteObject : function (url, data) {
      // post request to delete album/place/photo - data is the id of the object
      $.ajax({
         type : "post",
         dataType : "json",
         "url" : url,
         "data" : data,
         success : function (data) {
            if (data.error) {
               alert(data.error);
            }
         },
         error : function (err) {
            alert(err.toString());
         }
      });
   },

   fitMask : function () {
      // fit mask of overlay/expose/fancybox on top map between header and footer
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

   openShareURL : function () {
      
      var url = main.getUIState().getAlbumShareURL().url;

      this.loadOverlay($(".mp-share-overlay"));
      this.fitMask($("#exposeMask"));
      //load link in input field and highlight it
      $("#mp-share-link")
         .val(url)
         .focus(function () {
            $(this).select();
         }).focus();
      main.getUI().getControls().bindCopyListener();
   },
   setCursor : function ($element, style) {
      $element.css('cursor', style);
   },

};
