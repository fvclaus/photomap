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
   centerElement : function ($parent, $element, direction) {
      
      var margin;
      
      switch (direction) {
      
      case "horizontal":
         margin = "0 ";
         margin += (this.getRealWidth($parent) - $element.width()) / 2;
         margin += "px";
         break;
      case "vertical":
         margin = (this.getRealHeight($parent) - $element.height()) / 2;
         margin += "px ";
         margin += "0";
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
      
   calculateFontSize : function (title, desiredWidth, desiredHeight) {
      
      var $fontEl, size = 1;
      
      $fontEl =
         $("<span></span>")
            .text(title)
            .appendTo($("body"))
         .css("fontSize", size + "px");
      
         console.log("------");
      do {
         $fontEl.css("fontSize", (size++) + ("px"));
         console.log($fontEl.width());
         console.log(desiredWidth);
      } while ($fontEl.height() < desiredHeight && $fontEl.width() < desiredWidth);
      $fontEl.remove();
      
         console.log(size - 1);
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
         return "No results";
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
