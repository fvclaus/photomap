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
      console.log(columns);
      while (i <= columns) {
         console.log(i);
         matrix[k].push(array[j]);
         if (j === array.length - 1) {
            break;
         }
         if (i === columns - 1) {
            console.dir(matrix);
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
      
      var margin;
      
      switch (direction) {
      
      case "vertical":
         margin = (this.getRealHeight($parent) - $element.height()) / 2;
         margin += "px 0";
         break;
      case "horizontal":
         margin = "0 ";
         margin += (this.getRealWidth($parent) - $element.width()) / 2;
         margin += "px";
         break;
      default:
         margin = (this.getRealHeight($parent) - $element.height()) / 2;
         margin += "px ";
         margin += (this.getRealWidth($parent) - $element.width()) / 2;
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
         },
      });
   },

   fitMask : function ($maskID) {
      // fit mask of overlay/expose/fancybox on top map between header and footer
      $maskID.css({
         'max-height': $('#mp-map').height(),
         'max-width': $('#mp-map').width(),
         'top': $('#mp-map').offset().top,
         'left': $('#mp-map').offset().left,
         'z-index': 1000
      });
   },

   loadOverlay : function ($trigger) {
      $trigger
         .overlay({
            top: '25%',
            load: true,
            mask: {
               color: "white",
               opacity: 0.7,
            }
         })
         .load();
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
   }
};
