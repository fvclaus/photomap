/*global define, $, QUnit*/

"use strict";

define(["dojo/_base/declare",
         "../widget/GalleryWidget",
         "./MultiplePagesPhotoWidget",
         "dojo/domReady!"],
        function (declare, GalleryWidget, PhotoWidgetTestCase) {
           var GalleryTest = declare([PhotoWidgetTestCase], {
              name : "Gallery",
              $containerTemplate : $("<section id=mp-gallery></section>"),

              PhotoWidget : GalleryWidget,
              nPhotosInWidget : 5,
              photosInWidgetAssertions : 15,
              assertPhotosInWidget : function (photos) {
                  var $imgs = this.$testBody.find(".mp-thumb");
                  $imgs.each(function (index, el) {
                     if (photos[index]) {
                        QUnit.ok$visible($(el));
                        QUnit.ok($(el).attr("data-keiken-id") === photos[index].id.toString());
                        QUnit.ok($(el).attr("src") !== undefined);
                     } else {
                        QUnit.ok$hidden($(el));
                        QUnit.ok($(el).attr("data-keiken-id") === undefined);
                        QUnit.ok($(el).attr("src") === undefined);
                     }
                  });
               }
           }),
               test = new GalleryTest({ navigateToInsertedPhoto : true } );
           
           test.run();
        });
