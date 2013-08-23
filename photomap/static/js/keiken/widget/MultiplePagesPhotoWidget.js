/*jslint sloppy : true*/
/*global $, define, window, assertInstance, assertFunction, assert, assertTrue, gettext */

// No use strict with this.inherited(arguments);
// "use strict";

/**
 * @author Frederik Claus
 * @description Widgets of this class display photos on multiple pages (if there is more than on page) and provide standard navigation function navigateTo and navigateWithDirection.
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
             /*
              * @public
              * @description Navigates the slideshow left or right.
              * @param {String} direction: left || right
              */
             navigateWithDirection : function (direction) {
                assertTrue(direction === "left" || direction === "right", "slideshow can just navigate left or right");
                
                if (!this._run) {
                   this.run();
                } else {
                   if (direction === "left") {
                      this.carousel.navigateLeft();
                   } else {
                      this.carousel.navigateRight();
                   }
                }
             }
          });
       });
