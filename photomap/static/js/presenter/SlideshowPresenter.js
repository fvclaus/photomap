/*jslint */ 
/*global $, define, main, assertTrue, ALBUM_VIEW, assertNotNull */

"use strict";

define(["dojo/_base/declare", "presenter/Presenter", "util/Communicator"],
       function (declare, Presenter, communicator) {
          return declare(Presenter, {
             isStarted : function () {
                return this.view.isStarted();
             },
             /*
              * @view
              * @description Reacts to a click on the slideshow image.
              */
             click : function () {
                communicator.publish("click:slideshowImage");
             },
             /*
              * @public
              * @description Signals the slideshow to navigate to the speicified photo
              * @param {Photo} photo: Must not be null.
              */
             navigateTo : function (photo) {
                assertNotNull(photo);
                if (!this.view.isStarted()) {
                   this.view.start(photo);
                } else {
                   this.view.navigateTo(photo);
                }
             },
             /*
              * @public
              */
             navigate : function (direction) {
                this.view.navigate(direction);
             },
             // navigate() violated information hiding
             /* 
              * @public
              */
             insertPhoto : function (photo) {
                this.view.insertPhoto(photo);
                this.view.updateMessage();
             },
             /*
              * @public
              */
             deletePhoto : function (photo) {
                this.view.deletePhoto(photo);
             },
             /*
              * @public
              */
             resetPlace : function (place) {
                this.view.resetPlace(place);
             },
             /* 
              * @public
              * @description Restarts the slideshow if for example the photo order was changed.
              */
             restart : function (photos) {
                this.view.restart(photos);
             },
             /*
              * @public
              */
             reset : function () {
                this.view.reset();
                this.view.updateMessage();
             }
             
          });
       });
