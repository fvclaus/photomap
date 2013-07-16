/*jslint sloppy:true */ 
/*global $, define, main, DASHBOARD_VIEW, ALBUM_VIEW */

// No use strict possible with this.inherited(arguments)
// "use strict";

define(["dojo/_base/declare", "presenter/Presenter", "util/Communicator"],
       function (declare, Presenter, communicator) {
          return declare(Presenter, {
             constructor : function () {
                this.inherited(arguments);
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
