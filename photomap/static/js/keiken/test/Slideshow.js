/*global define, $, QUnit*/

"use strict";

define(["dojo/_base/declare",
         "../widget/SlideshowWidget",
         "./MultiplePagesPhotoWidget"],
        function (declare, SlideshowWidget, PhotoWidgetTestCase) {
           var SlideshowTest = declare([PhotoWidgetTestCase], {
              name : "Slideshow",
              $containerTemplate : $("<section id=mp-slideshow></section>"),
              PhotoWidget : SlideshowWidget,
              nPhotosInWidget : 1,
              photosInWidgetAssertions : 3,
              assertPhotosInWidget : function (photos) {
                 var photo = photos[0],
                     $image = $(".mp-slideshow-image"),
                      $photoNumber = $(".mp-image-number"),
                      expectedText = "";
                 if (photo) {
                    expectedText = "Photo " + (this.photos.indexOf(photo) + 1) +  "/" + this.photos.length;
                    QUnit.ok$visible($image);
                    QUnit.ok$text($photoNumber, expectedText);
                    QUnit.ok(parseInt($image.attr("data-keiken-id"), 10) === photo.id, "The slideshow image should display the photo with id " + photo.id);
                 } else {
                    QUnit.ok($image.attr("src") === undefined);
                     QUnit.ok$text($photoNumber, "");
                     QUnit.ok($image.attr("data-keiken-id") === undefined, "The fullscreen image should not have a data attribute");
                 }
               }

           }),
               test = new SlideshowTest({});

           test.run();
        });




