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
               photoCollection = null,
               assertTooltipPresence = function (present) {
                  if (present) {
                     QUnit.ok$visible($(".mp-infotext"));
                  } else {
                     QUnit.ok$hidden($(".mp-infotext"));
                  }
               },
               assertPhotoInWidget = function (photo) {
                  var $image = $(".mp-slideshow-image"),
                      expectedText = "Photo " + (photos.indexOf(photo) + 1) +  "/" + photos.length;
                  QUnit.ok$visible($image);
                  QUnit.ok$text($(".mp-image-number"), expectedText);
                  QUnit.ok(parseInt($image.attr("data-keiken-id")) === photo.id, "The slideshow image should display the photo with id " + photo.id);
               },
               animationTime = 1500;

                  

           module("Slideshow", {
              setup : function () {
                 $testBody
                    .empty()
                    .append($container);

                 slideshow = new SlideshowWidget(null, $container.get(0));
                 photoCollection = testFixture.getRandomPhotoCollection(12);
                 photos = photoCollection.getAll();
              },
              teardown : function () {
                 $testBody.empty();
                 // Necessary to register the same widget id again.
                 slideshow.destroyRecursive(false);
              }
           });
           
           QUnit.asyncTest("startup/loadPhotos", 7, function () {
              // No startup yet.
              QUnit.raiseError(slideshow.run, slideshow);
              QUnit.raiseError(slideshow.load, slideshow, photoCollection);
              slideshow.startup();
              // Multiple calls to startup
              slideshow.startup();
              // Wait for the tooltip to fade in.
              // The time needs to be adjusted manually.  
              setTimeout(function () {
                 assertTooltipPresence(true);
                 // No args loadPhoto.
                 QUnit.raiseError(slideshow.load, slideshow);
                 // Wrong parameter
                 QUnit.raiseError(slideshow.load, slideshow, photos);
                 slideshow.load(testFixture.getRandomPhotoCollection(0));
                 // Make sure the tooltip does not go away.
                 setTimeout(function() {
                    assertTooltipPresence(true);
                    slideshow.load(photoCollection);
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
              slideshow.load(photoCollection);
              slideshow.run();
              setTimeout(function () {
                 assertTooltipPresence(false);
                 assertPhotoInWidget(photos[0]);
                 QUnit.start();
              }, animationTime);
           });

           QUnit.asyncTest("navigateWithDirection", 11, function () {
              slideshow.startup();
              slideshow.load(photoCollection);
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
                    }, 2 *  animationTime);
                 },  animationTime);
              },  animationTime);
           });

           QUnit.asyncTest("navigateTo", 7, function () {
              slideshow.startup();
              slideshow.load(photoCollection);
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
              slideshow.load(photoCollection);
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
              slideshow.load(photoCollection);
              slideshow.run();

              QUnit.raiseError(slideshow.insertPhoto, slideshow);

              photoCollection.insert(newPhoto);
              // slideshow.insertPhoto(newPhoto);

              setTimeout(function () {
                 // Make sure the image counter incremented properly.
                 assertPhotoInWidget(photos[0]);
                 slideshow.navigateTo(newPhoto);
                 setTimeout(function () {
                    assertPhotoInWidget(newPhoto);
                    for (photoIndex = 0; photoIndex < 20; photoIndex++) {
                       // newPhoto = testFixture.getRandomPhoto(13 + photoIndex);
                       photoCollection.insert(newPhoto);
                       // slideshow.insertPhoto(newPhoto);
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
                  photoIndex = 0,
                  nPhotos = photos.length;

              slideshow.startup();
              slideshow.load(photoCollection);
              slideshow.run();

              QUnit.raiseError(slideshow.deletePhoto, slideshow);

              photoCollection.delete(photos[0]);
              // slideshow.deletePhoto(oldPhoto);

              setTimeout(function () {
                 // Make sure the image counter is decremented properly.
                 // Make sure the slideshow navigates to the 2nd photo.
                 assertPhotoInWidget(photos[0]);
                 nPhotos = photos.length;
                 for (photoIndex = 0; photoIndex < nPhotos ; photoIndex++) {
                    // oldPhoto = photos[0];
                    photoCollection.delete(photos[0]);
                    // slideshow.deletePhoto(oldPhoto);
                 }
                 setTimeout(function () {
                    assertTooltipPresence(true);
                    QUnit.start();
                 }, 2 * animationTime);
              }, 2 * animationTime);
           });
        });
