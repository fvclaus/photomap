/*jslint sloppy : true*/
/*global $, define, window, assertInstance, assertFunction, assert, assertTrue, gettext */

// No use strict with this.inherited(arguments);
// "use strict";

/**
 * @author Frederik Class
 * @description Widgets of this class display only one photo per page on several pages.
 */
define(["dojo/_base/declare",
        "./MultiplePagesPhotoWidget",
        "../model/Photo",
        "../util/Tools"], 
       function (declare, PhotoWidget, Photo, tools) {
          return declare([PhotoWidget], {
             /**
              * @private
              * @description Finds the current photo based on the data id attribute the PhotoCarousel sets on every photo element. The currentPhoto will be saved as this.currentPhoto
              */
             _findCurrentPhoto : function () {
                assert(this._started, true, "slideshow has to be started already");

                var photos = this.carousel.getAllPhotos(),
                    currentPhoto = null,
                    // The PhotoCarousel will set the id of the photo as an attribute of the img element.
                    id = parseInt(this.$image.attr(this.carousel.ID_HTML_ATTRIBUTE));

                // if it is the only (empty) page the entry is null
                if (photos.length > 0) {
                   currentPhoto = tools.getObjectByKey("id", id, photos);
                }
                this.currentPhoto = currentPhoto;
             }
          });
       });
