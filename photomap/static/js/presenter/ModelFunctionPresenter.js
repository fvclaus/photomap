/*jslint */
/*global $, define, main, DASHBOARD_VIEW, ALBUM_VIEW */

"use strict";

/**
 * @author Frederik Claus
 * @class UIControls adds Listener to all input elements that are present once the site is loaded
 */


define(["dojo/_base/declare", "presenter/Presenter"],
       function (declare, Presenter) {
          return declare(Presenter, {
             constructor : function (view) {
                this.currentContext = null;
             },
             setCurrentContext : function (context) {
                console.log("MFP setCurrentContext");
                console.log(context);
                this.currentContext = context;
             },
             /**
              * @public
              */
             update : function (event) {
                  
                if (!this.view.isDisabled()) {
                  this.currentContext.update(event);
                }
             },

             /**
              * @public
              */
             "delete" : function (event) {
     
                if (!this.view.isDisabled()) {
                   this.currentContext.delete(event);
                }
             },
             /**
              * @private
              */
             share : function (event) {

                if (!this.view.isDisabled()) {
                   this.currentContext.share();
                }
             }
          });
       });
