/*jslint */
/*global */

"use strict";

define(["dojo/_base/declare"],
       function (declare) {
          return declare(null, {
             constructor : function () {
                this.presenter = null;
                
                this.disabled = false;
             },
             enable : function () {
                this.disabled = false;
             },
             disable : function () {
               this.disabled = true; 
             },
             isDisabled : function () {
                return this.disabled;
             },
             getPresenter : function () {
                return this.presenter;
             }
          });
       });
