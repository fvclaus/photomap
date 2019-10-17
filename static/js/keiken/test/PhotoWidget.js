/*global define, $, QUnit, assertTrue, assertNumber, assertObject, assertFunction*/

"use strict";

define(["dojo/_base/declare",
        "dojo/_base/lang",
         "keiken/test/TestFixture",
        "./AsyncTestCase"],
       function (declare, lang, TestFixture, AsyncTestCase) {
           return declare([AsyncTestCase], {
              constructor : function (options) {
                 //TODO assert that Widget inherits from PhotoWidget
                 assertFunction(this.PhotoWidget, "Every PhotoWidget must define its constructor.");
                 assertObject(this.$containerTemplate, "Every PhotoWiget test case needs to define a $container object.");
                 assertFunction(this.assertPhotosInWidget, "Every PhotoWidget needs to define a assertPhotosInWidget function.");
                 assertNumber(this.photosInWidgetAssertions, "Every PhotoWidget needs to define the number of assertions in assertPhotosInWidget.");
                 assertNumber(this.nPhotos, "Every PhotoWidget needs to define the number of photos used.");

                 this.options = $.extend({}, {
                    animationTime : 1800
                 }, options);
                 // this.PhotoWidget = PhotoWidget;
                 this.fixture = new TestFixture();
              },
              setUp : function () {
                 var $container = this.$containerTemplate.clone();
                 this.$testBody = $("#testBody")
                    .empty()
                    .append($container);

                 this.widget = new this.PhotoWidget(null, $container.get(0));
                 this.photoCollection = this.fixture.getRandomPhotoCollection(this.nPhotos);
                 this.photos = this.photoCollection.getAll();
                 this.$container = this.$testBody.children();
                 this.$container.show();
              },
              infoTextPresenceAssertions : 1,
              assertInfoTextPresence : function (present) {
                  var $infoText = $(".mp-infotext");
                  if (present) {
                     QUnit.ok$visible($infoText);
                  } else {
                     QUnit.ok($infoText.length === 0 || $infoText.is(":hidden"));
                  }
              },
              tearDown : function () {
                 this.$testBody.empty();
                 // Necessary to register the same widget id again.
                 this.widget.destroyRecursive(false);
              }
           });
       });

