/*jslint */
/*global $, main, */

"use strict";

define(["dojo/_base/declare", "presenter/Presenter", "util/Communicator", "ui/UIState"], 
       function (declare, Presenter, communicator, state) {
          return declare (Presenter, {
             init : function () {
                this.view.init();
             },
             hideDetail : function () {
                this.view.hideDetail();
             },
             update : function (model) {
                this.view.update(model);
             },
             empty : function (model) {
                this.view.empty(model);
             },
             updateUsedSpace : function (data) {
                this.view.updateUsedSpace(data);
             },
             slideIn : function () {
                this.view.slideIn();
             },
             slideOut : function () {
                this.view.slideOut();
             },
             closeDetail : function () {
                if (state.isDashboardView()) {
                   this.slideOut();
                } else {
                   this.hideDetail();
                }
                communicator.publish("close:detail");
             }
          });
       });
