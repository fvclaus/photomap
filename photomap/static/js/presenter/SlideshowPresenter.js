/*jslint */ 
/*global $, define, main, DASHBOARD_VIEW, ALBUM_VIEW */

"use strict";

define(["dojo/_base/declare", "presenter/Presenter", "util/Communicator"],
       function (declare, Presenter, communicator) {
          return declare(Presenter, {
             init : function () {
                this.view.init();
             },
             isStarted : function () {
                return this.view.isStarted();
             },
             click : function () {
                communicator.publish("click:slideshowImage");
             },
             navigateTo : function (photo) {
                this.view.navigateTo(photo);
             },
             navigate : function (direction) {
                assertTrue(direction === "left" || direction === "right", "slideshow can just navigate left or right");
                
                if (!this.view.isStarted()) {
                   this.view.start();
                } else {
                   if (direction === "left") {
                      this.view.getCarousel().navigateLeft();
                   } else {
                      this.view.getCarousel().navigateRight();
                   }
                }
             },
             insertPhoto : function (photo) {
                this.view.insertPhoto(photo);
             },
             deletePhoto : function (photo) {
                this.view.deletePhoto(photo);
             },
             placeDeleteReset : function (place) {
                this.view.placeDeleteReset(place);
             },
             restart : function (photos) {
                this.view.getCarousel().update(photos);
             },
             reset : function () {
                this.view.reset();
             }
             
          });
       });
