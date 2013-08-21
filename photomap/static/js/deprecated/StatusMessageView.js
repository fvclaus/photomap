/*global $, define*/

"use strict";


define(["dojo/_base/declare", "view/View"], 
       function (declare, View) {
          return declare(View,  {
             constructor : function () {
                this.$container = $("#mp-status-message");
                this.$message = this.$container.find("strong");
             },
             _toggle : function (text) {
                this.$container
                   .toggle("slide", { direction : "up" });
             },
             hide : function (text) {
                if (this.$container.is(":visible")){
                   this._toggle();
                }
             },
             update : function (text) {
                this.$message
                   .text(text);
                this.$container.css("margin-left", -1 * (this.$container.width() / 2) + "px");

                if (!this.$container.is(":visible")){
                   this._toggle();
                } 
             },
          });
       });
   