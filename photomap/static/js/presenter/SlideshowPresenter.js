/*jslint */ 
/*global $, define, main, DASHBOARD_VIEW, ALBUM_VIEW */

"use strict";

define(["dojo/_base/declare", "util/Communicator"],
       function (declare, communicator) {
          return declare(null, {
             constructor : function (view) {
                
                this.view = view;
                
             },
             init : function () {
                this.view.init();
             },
             navigateTo : function (photo) {
                this.view.navigateTo(photo);
             },
             insertPhoto : function (photo) {
                this.view.insertPhoto(photo);
             },
             deletePhoto : function (photo) {
                this.view.deletePhoto(photo);
             },
             placeDeleteReset : function (place) {
                this.view.placeDeleteReset(place);
             },
             reset : function () {
                this.view.reset();
             }
             
          });
       });
