/*jslint */
/*global $, main, */

"use strict";

define(["dojo/_base/declare", "presenter/Presenter", "ui/UIState"], 
       function (declare, Presenter, state) {
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
             }
          });
       });
