/*jslint */
/*global $, main, define */

"use strict";

define([
   "dojo/_base/declare",
   "./Presenter",
   "../util/Communicator"
],
   function (declare, Presenter, communicator) {
      return declare (Presenter, {
         constructor : function (isDashboard) {
            this.isSLider = isDashboard;
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
            if (this.isSlider) {
               this.slideOut();
            } else {
               this.hideDetail();
            }
         }
      });
   });
