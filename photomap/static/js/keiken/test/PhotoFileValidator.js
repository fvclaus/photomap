/*global define, $, QUnit, FormData*/

"use strict";

define(["dojo/_base/declare",
        "../util/PhotoFileValidator"],
       function (declare, PhotoFileValidator) {

           var $testBody = $("#testBody"),
               validator = new PhotoFileValidator(),
               $container = null,
               generateEvent = function (size, mimeType) {
                  return {
                     target : {
                        files : [ {
                           "size" : size,
                           type : mimeType
                        }]
                     }
                  };
               };


          module("PhotoFileValidator", {
             setup : function () {
                $container = $("<input type='file' />");
                $testBody.append($container);
                $container = $testBody.find("input").eq(0);
             },
             teardown : function () {
                $testBody.empty();
             }
          });

          QUnit.test("validate", function () {
             validator.validate($container, generateEvent(2 * Math.pow(2, 20), "image/jpeg"));
             QUnit.ok($testBody.find(".ui-state-highlight").size() > 0);
             validator.validate($container, generateEvent(300, "application/pdf"));
             QUnit.ok($testBody.find(".ui-state-error").size() > 0);
             validator.validate($container, generateEvent(300, "image/jpeg"));
             QUnit.ok($testBody.find("div").size() === 0);
             QUnit.ok(validator.getFile());
          });
       });
             
