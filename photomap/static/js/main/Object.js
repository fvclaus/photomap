/*global define, assertObject*/

"use strict";

define(["dojo/_base/declare"],
       function (declare, module) {
          return declare(null, {
             log : function (message) { 
                assertObject(this.module, "Please include 'module' in your initial define() statement and make this.module a reference.");
                console.log(this.module.id + ": " + message);
             }
          });
       });
       