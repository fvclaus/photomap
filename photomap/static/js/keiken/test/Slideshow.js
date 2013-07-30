/*global require, $, QUnit*/

"use strict";

require(["widget/SlideshowWidget",
         "keiken/test/TestFixture",
        "dojo/domReady!"],
        function (SlideshowWidget, TestFixture) {

           var slideshow = null,
               $testBody = $("#testBody"),
               $container = $("<section id=mp-slideshow></section>"),
               textFixture = new TestFixture(),
               photos = textFixture.getPhotos(12),
               assertTooltipPresence = function (present) {
                  if (present) {
                     QUnit.ok$1($(".mp-tooltip"));
                  } else {
                     QUnit.ok$0($(".mp-tooltip"));
                  }
               },
               assertPhotoInGallery = function (photo) {
                  var $image = $(".mp-slideshow-image"),
                      expectedText = "Photo " + (photos.indexOf(photo) + 1) +  "/" + photos.length;
                  QUnit.ok$visible($image);
                  QUnit.ok$text($(".mp-image-number"), expectedText);
                  QUnit.ok(parseInt($image.attr("data-keiken-id")) === photo.id, "The slideshow image should display the photo with id " + photo.id);
               };

                  

           module("Slideshow", {
              setup : function () {
                 $testBody
                    .empty()
                    .append($container);

                 slideshow = new SlideshowWidget(null, $container.get(0));
              },
              teardown : function () {
                 $testBody.empty();
                 // Necessary to register the same widget id again.
                 slideshow.destroyRecursive(false);
              }
           });
           
           QUnit.asyncTest("startup", 7, function () {
              // No startup yet.
              assertTooltipPresence(false);
              QUnit.raiseError(slideshow.startCarousel, slideshow);
              QUnit.raiseError(slideshow.loadPhotos, slideshow, photos);
              slideshow.startup();
              // Multiple calls to startup
              slideshow.startup();
              // Wait for the tooltip to fade in.
              // The time needs to be adjusted manually.  
              setTimeout(function () {
                 assertTooltipPresence(true);
                 // No args loadPhoto.
                 QUnit.raiseError(slideshow.loadPhotos, slideshow);
                 slideshow.loadPhotos([]);
                 // Make sure the tooltip does not go away.
                 setTimeout(function() {
                    assertTooltipPresence(true);
                    slideshow.loadPhotos(photos);
                    // Make sure the tooltip does not go away.
                    setTimeout(function () {
                       assertTooltipPresence(true);
                       QUnit.start();
                    }, 300);
                 }, 300);
              }, 300);
           });

           QUnit.asyncTest("startCarousel", 3,  function () {
              slideshow.startup();
              slideshow.loadPhotos(photos);
              slideshow.startCarousel();
              setTimeout(function () {
                 assertPhotoInGallery(photos[0]);
                 QUnit.start();
              }, 1200);
           });

           QUnit.asyncTest("navigateWithDirection", 11, function () {
              slideshow.startup();
              slideshow.loadPhotos(photos);
              // navigateWithDirection is supposed to start the slideshow if it is not running yet.
              slideshow.navigateWithDirection("right");
              QUnit.raiseError(slideshow.navigateWithDirection, slideshow, 3);
              QUnit.raiseError(slideshow.navigateWithDirection, slideshow, "wrong");
              slideshow.navigateWithDirection("left");
              setTimeout(function () {
                 assertPhotoInGallery(photos[11]);
                 slideshow.navigateWithDirection("right");
                 setTimeout(function () {
                    assertPhotoInGallery(photos[0]);
                    slideshow.navigateWithDirection("right");
                    slideshow.navigateWithDirection("right");
                    slideshow.navigateWithDirection("right");
                    slideshow.navigateWithDirection("right");
                    setTimeout(function () {
                       assertPhotoInGallery(photos[4]);
                       QUnit.start();
                    }, 1200);
                 }, 1200);
              }, 1200);
           });

           QUnit.asyncTest("navigateTo", 7, function () {
              slideshow.startup();
              slideshow.loadPhotos(photos);
              // No parameter not legal.
              QUnit.raiseError(slideshow.navigateTo, slideshow);
              // This should be the same as slideshow.startCarousel()
              slideshow.navigateTo(null);
              setTimeout(function () {
                 assertPhotoInGallery(photos[0]);
                 slideshow.navigateTo(photos[7]);
                 setTimeout(function () {
                    assertPhotoInGallery(photos[7]);
                    QUnit.start();
                 }, 1200);
              }, 1200);
           });

        });
