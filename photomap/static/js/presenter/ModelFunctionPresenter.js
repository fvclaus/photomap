/*jslint */
/*global $, define, main, DASHBOARD_VIEW, ALBUM_VIEW */

"use strict";

/**
 * @author Frederik Claus
 * @class UIControls adds Listener to all input elements that are present once the site is loaded
 */


define(["dojo/_base/declare", "presenter/Presenter", "util/Communicator"],
       function (declare, Presenter, communicator) {
          return declare(Presenter, {
             constructor : function (view) {
                this.currentContext = null;
             },
             setCurrentContext : function (model) {
                console.log("MFP setCurrentContext");
                console.log(model);
                if (model.getModel) {
                   this.currentContext = model.getModel();
                } else {
                   this.currentContext = model;
                }
             },
             /**
              * @public
              */
             update : function (event) {
                
                if (!this.view.isDisabled()) {
                  communicator.publish("click:UpdateControl", this.currentContext);
                }
             },

             /**
              * @public
              */
             "delete" : function (event) {
                
                if (!this.view.isDisabled()) {
                  communicator.publish("click:DeleteControl", this.currentContext);
                }
             },
             /**
              * @private
              */
             share : function (event) {
                
                if (!this.view.isDisabled()) {
                  communicator.publish("click:ShareControl", this.currentContext);
                }
             }
          });
       });
