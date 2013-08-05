/*jslint */ 
/*global $, define, assertNotNull, main, DASHBOARD_VIEW, ALBUM_VIEW */

"use strict";

define(["dojo/_base/declare", "presenter/Presenter", "util/Communicator", "ui/UIState"],
       function (declare, Presenter, communicator, state) {
          return declare(Presenter, {
             isStarted : function () {
                return this.view.isStarted();
             },

             /*
              * @view
              * @description Reacts to a click on one of the gallery thumbs."
              * @param {Photo} photo
              */
             click : function (photo) {
                assertNotNull(photo);
                if (!this.view.isDisabled()) {
                  communicator.publish("click:galleryThumb", photo);
                }
             },
             navigateIfNecessary : function (photo) {
                this.view.navigateIfNecessary(photo);
             },
             insertPhoto : function (photo) {
                this.view.insertPhoto(photo);
             },
             deletePhoto : function (photo) {
                this.view.deletePhoto(photo);
             },
             restart : function (photos) {
                this.view.restart(photos);
             },
             load : function (photos) {
                this.view.load(photos);
             },
             start : function () {
                this.view.start();
             },
             reset : function () {
                this.view.reset();
             },
             triggerClickOnPhoto : function () {
               this.view.triggerClickOnPhoto(); 
             },
             setPhotoVisited : function (photo) {
                this.view.setPhotoVisited(photo);
             },
             
          });
       });
