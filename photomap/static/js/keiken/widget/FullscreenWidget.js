/*jslint sloppy : true*/
/*global $, define, window, assertInstance, assert, assertTrue, gettext */

// No use strict with this.inherited(arguments);
// "use strict";

/**
 * @author Marc Roemer
 * @description Displays current slideshow-image as fullscreen, supports zooming into the image
 */
define(["dojo/_base/declare",
        "./OnePhotoPerPageWidget",
        "../model/Photo", 
        "../util/Communicator", 
        "../util/Tools",
        "dojo/text!./templates/Fullscreen.html",
        "dojo/i18n",
        "dojo/i18n!./nls/common",
        "dojo/domReady!"], 
       function (declare, PhotoWidget, Photo, communicator, tools, template, i18n) {
          return declare([PhotoWidget], {
             templateString : template,

             viewName : "Fullscreen",

             startup : function () {
                if (this._started) {
                   return;
                }
                this. _carouselOptions = {
                   lazy : true,
                   loader : this.$loader,
                   onUpdate : this._update,
                   context : this
                };
                this._srcPropertyName = "photo";
                this.$photos = this.$image;

                this.inherited(arguments);

                this.iconHelpCount = 5;
                this.$controls = $()
                   .add(this.$navLeft)
                   .add(this.$navRight)
                   .add(this.$close);
                
                assert(this.$controls.size(), 3, "there have to be 3 controls");
                
                this.visible = false;
                this.disabled = true;
             },
             postMixInProperties : function () {
                this.inherited(arguments);
                this.messages = i18n.getLocalization("keiken/widget", "common", this.lang);
             },
             show : function () {
                
                this.$container.show();
                this.visible = true;
                // fullscreen is just active if mouse is moved or fullscreen is focused (needed for keyboard events)
                this.$container.focus();
                
             },
             hide : function () {
                this.$container.hide();
                this.visible = false;
             },
             /**
              * @presenter
              * @description Resets the slideshow
              * This will put the Slideshow in the state that it was after startup() was called.
              */
             reset : function () {
                // this._started = false;
                if (this._started) { 
                   if (this.carousel !== null) {
                      this.carousel.destroy();
                      this.carousel = null;
                   }
                   this._loaded = false;
                   this._run = false;
                   this.$title.empty();
                }
             },
             /**
              * @private
              * @description Executed after photo is updated (=displayed)
              */
             _update : function () {
                console.log("FullscreenWidget: _update");
                this._findCurrentPhoto();
                // deleted last photo
                if (this.currentPhoto  === null) {
                   this.$title.empty();
                } else {
                   // right now this is the first time we can update the description
                   // on the other events, beforeLoad & afterLoad, the photo src is not set yet
                   this.$title.text(this.currentPhoto.title);
                }
             },
             _bindListener : function () {
                
                var instance = this;
                this.$navLeft.on("click.Fullscreen", function () {
                   console.log("FullscreenWidget: navigating left");
                   instance.carousel.navigateLeft();
       
                   communicator.publish("navigate:fullscreen", "left");
                });
                this.$navRight.on("click.Fullscreen", function () {
                   console.log("FullscreenWidget: navigating right");
                   instance.carousel.navigateRight();

                   communicator.publish("navigate:fullscreen", "right");

                });
                this.$close.on("click.Fullscreen", function () {
                   console.log("FullscreenWidget: close");
                   instance.hide();
                   communicator.publish("click:fullscreenClose");
                });
                $("body")
                   .on("keyup.Fullscreen", null, "esc", function () {
                      if (instance.active) {
                         instance.hide();
                         communicator.publish("click:fullscreenClose");
                      }
                   })
                   .on("keyup.Fullscreen", null, "left", function () {
                      if (instance.active) {
                         instance.carousel.navigateLeft();
                         console.log("FullscreenWidget: navigating left");
                         communicator.publish("navigate:fullscreen", "left");
                      }
                   })
                   .on("keyup.Fullscreen", null, "right", function () {
                      if (instance.active) {
                         instance.carousel.navigateRight();
                         console.log("FullscreenWidget: navigating right");
                         communicator.publish("navigate:fullscreen", "right");
                      }
                   });
             }
          });
       });


