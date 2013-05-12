/*jslint */ 
/*global $, define, main, DASHBOARD_VIEW, ALBUM_VIEW */

"use strict";

define(["dojo/_base/declare", "presenter/Presenter", "util/Communicator"],
       function (declare, Presenter, communicator) {
          return declare(Presenter, {
             init : function () {
                this.view.init();
                communicator.subscribe("done:fullscreenImageFadeout", this.setFadeoutDone, this);
             },
             open : function () {
                this.view.open();
             },
             close : function () {
                this.view.close();
             },
             update : function(photo) {
                if (photo) {
                   this.view.update(photo);
                }
             },
             navigate : function (direction) {
                this.view.update();
                communicator.publish("disable:fullscreen");
                communicator.publish("navigate:fullscreen", direction);
             },
             setFadeoutDone : function () {
                this.view.setFadeoutDone(true);
             }
             
          });
       });
