/*jslint */
/*global define, $*/

"use strict";

define([
   "dojo/_base/declare",
   "dojo/domReady!"
],
   function (declare, communicator) {
      return declare(null, {
         constructor : function () {
            this.$quota = $("#mp-user-limit");
         },
         update : function (used, limit) {
            this.$quota.text(used + "/" + limit + "MB");
         }
      });
   });
                         