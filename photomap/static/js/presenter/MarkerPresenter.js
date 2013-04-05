/*global $, main, define*/

"use strict";


define(["dojo/_base/declare", ],
       function (declare) {
          return declare(null , {
             constructor : function (view) {
                this.view = view;
             },

             mouseOver : function () {
                if (!main.getUI().isDisabled()) {
                   var instance = this;
                   //TODO circular reference starting at the models
                   main.getUI().getControls().show(instance.view);
                }
             },
             mouseOut : function () {
                // hide EditControls after a small timeout, when the EditControls are not entered
                // the place is never seamlessly connected to a place, so we need to give the user some time
                   //TODO circular reference starting at the models
                main.getUI().getControls().hide(true);
             }
          });
       });
