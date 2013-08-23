/*global define, $*/

"use strict";

define(["dojo/_base/declare",
        "../util/Communicator",
        "dojo/domReady!"],
       function (declare, communicator) {
          return declare(null, {
             constructor : function () {
                this.$pageTitle = $("#mp-page-title");
                this._bindListener();
             },
             _bindListener : function () {
                var instance = this;
                this.$pageTitle.on('click', function () {
                   communicator.publish("click:pageTitle");
                });
             },
             update : function (text) {
                this.$pageTitle.text(text);
             }
          });
       });
                        
                         