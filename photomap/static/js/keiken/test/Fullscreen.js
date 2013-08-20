/*global require, $, QUnit*/

"use strict";

require(["widget/FullscreenWidget",
         "keiken/test/TestFixture",
        "dojo/domReady!"],
        function (FullscreenWidget, TestFixture) {

           var fullscreen = null,
               $testBody = $("#testBody"),
               $container = $("<section id=mp-fullscreen></section> "),
               testFixture = new TestFixture(),
               photos = null,
               photoCollection = null,
               assertPhotoInWidget = function (photo) {
                  var $image = $("#mp-fullscreen-image"),
                      $title = $("#mp-fullscreen-title");

                  QUnit.ok$hidden($(".mp-fullscreen-loader"));
                  if (photo) {
                     QUnit.ok$visible($image);
                     QUnit.ok$text($title, photo.title);
                     QUnit.ok(parseInt($image.attr("data-keiken-id")) === photo.id, "The fullscreen image should display the photo with id " + photo.id);
                  } else {
                     QUnit.ok($image.attr("src") === undefined);
                     QUnit.ok$text($title, "");
                     QUnit.ok($image.attr("data-keiken-id") === undefined, "The fullscreen image should not have a data attribute");
                  }
               },
               animationTime = 1600;

                  

           module("Fullscreen", {
              setup : function () {
                 $testBody
                    .empty()
                    .append($container);

                 fullscreen = new FullscreenWidget(null, $container.get(0));
                 // The default style hides the fullscreen.
                 $("#" + $container.attr("id")).show();
                 photoCollection = testFixture.getRandomPhotoCollection(12);
                 photos = photoCollection.getAll();
              },
              teardown : function () {
                 $testBody.empty();
                 // Necessary to register the same widget id again.
                 fullscreen.destroyRecursive(false);
              }
           });
           
           QUnit.asyncTest("startup/loadPhotos", 16, function () {
              // No startup yet.
              QUnit.raiseError(fullscreen.run, fullscreen);
              QUnit.raiseError(fullscreen.load, fullscreen, photoCollection);
              fullscreen.startup();
              // Multiple calls to startup
              fullscreen.startup();
              // fullscreen.show();
              // Wait for the tooltip to fade in.
              // The time needs to be adjusted manually.  
              setTimeout(function () {
                 assertPhotoInWidget(null);
                 // No args loadPhoto.
                 QUnit.raiseError(fullscreen.load, fullscreen);
                 // Wrong input
                 QUnit.raiseError(fullscreen.load, fullscreen, photos);
                 fullscreen.load(testFixture.getRandomPhotoCollection(0));
                 // Make sure the tooltip does not go away.
                 setTimeout(function() {
                    assertPhotoInWidget(null);
                    fullscreen.load(photoCollection);
                    // Make sure the tooltip does not go away.
                    setTimeout(function () {
                       assertPhotoInWidget(null);
                       QUnit.start();
                    }, 300);
                 }, 300);
              }, 300);
           });

           QUnit.asyncTest("run", 4,  function () {
              fullscreen.startup();
              fullscreen.load(photoCollection);
              fullscreen.run();
              // fullscreen.show();
              setTimeout(function () {
                 assertPhotoInWidget(photos[0]);
                 QUnit.start();
              }, animationTime);
           });

           QUnit.asyncTest("navigateTo", 9, function () {
              fullscreen.startup();
              fullscreen.load(photoCollection);
              // fullscreen.show();
              // No parameter not legal.
              QUnit.raiseError(fullscreen.navigateTo, fullscreen);
              // This should be the same as fullscreen.run()
              fullscreen.navigateTo(null);
              setTimeout(function () {
                 assertPhotoInWidget(photos[0]);
                 fullscreen.navigateTo(photos[7]);
                 setTimeout(function () {
                    assertPhotoInWidget(photos[7]);
                    QUnit.start();
                 }, animationTime);
              }, animationTime);
           });

           QUnit.asyncTest("reset", 4, function () {
              fullscreen.startup();
              fullscreen.load(photoCollection);
              fullscreen.run();
              fullscreen.reset();
              setTimeout(function () {
                 //TODO PhotoAnimation can't be reset and executes even though a reset has been triggered
                 assertPhotoInWidget(null);
                 QUnit.start();
              }, animationTime);
           });

           QUnit.asyncTest("insertPhoto", 13,  function () {
              var newPhoto = testFixture.getRandomPhoto(12),
                  photoIndex = 0;
              fullscreen.startup();
              fullscreen.load(photoCollection);
              fullscreen.run();

              QUnit.raiseError(fullscreen.insertPhoto, fullscreen);
              photoCollection.insert(newPhoto);              
              // fullscreen.insertPhoto(newPhoto);

              setTimeout(function () {
                 // Make sure the image counter incremented properly.
                 assertPhotoInWidget(photos[0]);
                 fullscreen.navigateTo(newPhoto);
                 setTimeout(function () {
                    assertPhotoInWidget(newPhoto);
                    for (photoIndex = 0; photoIndex < 20; photoIndex++) {
                       photoCollection.insert(newPhoto);
                    }
                    setTimeout(function () {
                       assertPhotoInWidget(photos[12]);
                       QUnit.start();
                    }, animationTime);
                 }, animationTime);
              }, animationTime);
           });

           QUnit.asyncTest("deletePhoto", 9, function () {
              var oldPhoto = photos[0],
                  photoIndex = 0,
                  nPhotos = photos.length;
              fullscreen.startup();
              fullscreen.load(photoCollection);
              fullscreen.run();

              QUnit.raiseError(fullscreen.deletePhoto, fullscreen);
              photoCollection.delete(photos[0]);

              setTimeout(function () {
                 // Make sure the image counter is decremented properly.
                 // Make sure the fullscreen navigates to the 2nd photo.
                 assertPhotoInWidget(photos[0]);
                 nPhotos = photos.length;
                 for (photoIndex = 0; photoIndex < nPhotos; photoIndex++) {
                    photoCollection.delete(photos[0]);
                 }
                 setTimeout(function () {
                    assertPhotoInWidget(null);
                    QUnit.start();
                 }, animationTime);
              }, 2 * animationTime); // Needs more time for fading out.
           });
        });
