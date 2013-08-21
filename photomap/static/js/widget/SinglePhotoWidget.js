/*jslint sloppy : true*/
/*global $, define, window, assertInstance, assertFunction, assert, assertTrue, gettext */

// No use strict with this.inherited(arguments);
// "use strict";

/**
 * @author Marc Roemer
 * @description Displays current slideshow-image as fullscreen, supports zooming into the image
 */
define(["dojo/_base/declare",
        "./PhotoWidget",
        "../model/Photo",
        "../util/Tools"], 
       function (declare, PhotoWidget, Photo, tools) {
          return declare([PhotoWidget], {
             /**
              * @public
              * @description Navigates to the photo. Runs the widget if run has not been called before.
              * @param {Photo} photo
              */
             navigateTo : function (photo) {
                // Navigate to photo, displaying it when the slideshow is started
                assertTrue(photo instanceof Photo || photo === null, "Parameter photo must be an instance of Photo.");
                if (!this._run) {
                   this.run();
                } else {
                   this.carousel.navigateTo(photo);
                }
             },
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
