/*global require, $, QUnit*/

"use strict";

require(["widget/ModelOperationWidget",
         "keiken/test/TestFixture",
        "dojo/domReady!"],
        function (ModelOperationWidget, TestFixture) {

           var slideshow = null,
               $testBody = $("#testBody"),
               $container = $("<span class='mp-controls-wrapper ui-corner-all mp-nodisplay' id='mp-controls'>"),
               testFixture = new TestFixture(),
               photos = null,
               photoCollection = null,
               assertTooltipPresence = function (present) {
                  if (present) {
                     QUnit.ok$visible($(".mp-infotext"));
                  } else {
                     QUnit.ok$hidden($(".mp-infotext"));
                  }
               },
               modelOperation = null;

           module("ModelOperation", {
              setup : function () {
                 $testBody
                    .empty()
                    .append($container);
                 
                 modelOperation = new ModelOperationWidget(null, $container.get(0));
              }
           });

           QUnit.test("startup", function () {
              modelOperation.startup();
           });
        });

