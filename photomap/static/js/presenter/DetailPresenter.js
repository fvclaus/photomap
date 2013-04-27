/*jslint */
/*global $, main, */

"use strict";

define(["dojo/_base/declare", "ui/UIState"], 
       function (declare, state) {
          return declare (null, {
             constructor : function (view) {
                this.view = view;
             },
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
