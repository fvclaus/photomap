/*global require, $, QUnit*/

"use strict";

require(["widget/SlideshowWidget",
         "keiken/test/TestFixture",
        "dojo/domReady!"],
        function (SlideshowWidget, TestFixture) {

           var slideshow = null,
               $testBody = $("#testBody"),
               $container = $("<section id=mp-slideshow></section>"),
               testFixture = new TestFixture(),
               photos = null,
               assertTooltipPresence = function (present) {
                  if (present) {
                     QUnit.ok$visible($(".mp-tooltip"));
                  } else {
                     QUnit.ok$hidden($(".mp-tooltip"));
                  }
               },
               assertPhotoInWidget = function (photo) {
                  var $image = $(".mp-slideshow-image"),
                      expectedText = "Photo " + (photos.indexOf(photo) + 1) +  "/" + photos.length;
                  QUnit.ok$visible($image);
                  QUnit.ok$text($(".mp-image-number"), expectedText);
                  QUnit.ok(parseInt($image.attr("data-keiken-id")) === photo.id, "The slideshow image should display the photo with id " + photo.id);
               },
               animationTime = 1200;

                  

           module("Slideshow", {
              setup : function () {
                 $testBody
                    .empty()
                    .append($container);

                 slideshow = new SlideshowWidget(null, $container.get(0));
                 photos = testFixture.getRandomPhotos(12);
              },
              teardown : function () {
                 $testBody.empty();
                 // Necessary to register the same widget id again.
                 slideshow.destroyRecursive(false);
              }
           });
           
           QUnit.asyncTest("startup/loadPhotos", 6, function () {
              // No startup yet.
              QUnit.raiseError(slideshow.run, slideshow);
              QUnit.raiseError(slideshow.load, slideshow, photos);
              slideshow.startup();
              // Multiple calls to startup
              slideshow.startup();
              // Wait for the tooltip to fade in.
              // The time needs to be adjusted manually.  
              setTimeout(function () {
                 assertTooltipPresence(true);
                 // No args loadPhoto.
                 QUnit.raiseError(slideshow.load, slideshow);
                 slideshow.load([]);
                 // Make sure the tooltip does not go away.
                 setTimeout(function() {
                    assertTooltipPresence(true);
                    slideshow.load(photos);
                    // Make sure the tooltip does not go away.
                    setTimeout(function () {
                       assertTooltipPresence(true);
                       QUnit.start();
                    }, 300);
                 }, 300);
              }, 300);
           });

           QUnit.asyncTest("run", 4,  function () {
              slideshow.startup();
              slideshow.load(photos);
              slideshow.run();
              setTimeout(function () {
                 assertTooltipPresence(false);
                 assertPhotoInWidget(photos[0]);
                 QUnit.start();
              }, animationTime);
           });

           QUnit.asyncTest("navigateWithDirection", 11, function () {
              slideshow.startup();
              slideshow.load(photos);
              // navigateWithDirection is supposed to start the slideshow if it is not running yet.
              slideshow.navigateWithDirection("right");
              QUnit.raiseError(slideshow.navigateWithDirection, slideshow, 3);
              QUnit.raiseError(slideshow.navigateWithDirection, slideshow, "wrong");
              slideshow.navigateWithDirection("left");
              setTimeout(function () {
                 assertPhotoInWidget(photos[11]);
                 slideshow.navigateWithDirection("right");
                 setTimeout(function () {
                    assertPhotoInWidget(photos[0]);
                    slideshow.navigateWithDirection("right");
                    slideshow.navigateWithDirection("right");
                    slideshow.navigateWithDirection("right");
                    slideshow.navigateWithDirection("right");
                    setTimeout(function () {
                       assertPhotoInWidget(photos[4]);
                       QUnit.start();
                    }, animationTime);
                 }, animationTime);
              }, animationTime);
           });

           QUnit.asyncTest("navigateTo", 7, function () {
              slideshow.startup();
              slideshow.load(photos);
              // No parameter not legal.
              QUnit.raiseError(slideshow.navigateTo, slideshow);
              // This should be the same as slideshow.run()
              slideshow.navigateTo(null);
              setTimeout(function () {
                 assertPhotoInWidget(photos[0]);
                 slideshow.navigateTo(photos[7]);
                 setTimeout(function () {
                    assertPhotoInWidget(photos[7]);
                    QUnit.start();
                 }, animationTime);
              }, animationTime);
           });

           QUnit.asyncTest("reset", 1, function () {
              slideshow.startup();
              slideshow.load(photos);
              slideshow.run();
              slideshow.reset();
              setTimeout(function () {
                 assertTooltipPresence(true);
                 QUnit.start();
              }, animationTime);
           });

           QUnit.asyncTest("insertPhoto", 10,  function () {
              var newPhoto = testFixture.getRandomPhoto(12),
                  photoIndex = 0;
              slideshow.startup();
              slideshow.load(photos);
              slideshow.run();

              QUnit.raiseError(slideshow.insertPhoto, slideshow);
              
              slideshow.insertPhoto(newPhoto);
              photos.push(newPhoto);
              setTimeout(function () {
                 // Make sure the image counter incremented properly.
                 assertPhotoInWidget(photos[0]);
                 slideshow.navigateTo(newPhoto);
                 setTimeout(function () {
                    assertPhotoInWidget(newPhoto);
                    for (photoIndex = 0; photoIndex < 20; photoIndex++) {
                       newPhoto = testFixture.getRandomPhoto(13 + photoIndex);
                       slideshow.insertPhoto(newPhoto);
                       photos.push(newPhoto);
                    }
                    setTimeout(function () {
                       assertPhotoInWidget(photos[12]);
                       QUnit.start();
                    }, animationTime);
                 }, animationTime);
              }, animationTime);
           });

           QUnit.asyncTest("deletePhoto", 5, function () {
              var oldPhoto = photos[0],
                  photoIndex = 0;
              slideshow.startup();
              slideshow.load(photos);
              slideshow.run();

              QUnit.raiseError(slideshow.deletePhoto, slideshow);
              
              slideshow.deletePhoto(oldPhoto);
              photos.splice(0, 1);
              setTimeout(function () {
                 // Make sure the image counter is decremented properly.
                 // Make sure the slideshow navigates to the 2nd photo.
                 assertPhotoInWidget(photos[0]);
                 for (photoIndex = 0; photoIndex < photos.length; photoIndex++) {
                    slideshow.deletePhoto(photos[photoIndex]);
                 }
                 setTimeout(function () {
                    assertTooltipPresence(true);
                    QUnit.start();
                 }, animationTime);
              }, animationTime);
           }, animationTime);
        });
