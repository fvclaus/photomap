/*global require, $, QUnit, steal*/

"use strict";

require(["widget/GalleryWidget",
         "keiken/test/TestFixture",
         "util/Communicator",
         "dojo/domReady!"],
        function (GalleryWidget, TestFixture, communicator) {
           var gallery = null,
               $testBody = $("#testBody"),
               $container = $("<section id=mp-gallery></section>"),
               testFixture = new TestFixture(),
               photos = null,
               assertTooltipPresence = function (present) {
                  if (present) {
                     QUnit.ok$visible($(".mp-tooltip"));
                  } else {
                     QUnit.ok$hidden($(".mp-tooltip"));
                  }
               },
               nPhotosInGalleryAssertions = 10,
               assertPhotosInGallery = function (photos) {
                  var $imgs = $testBody.find(".mp-thumb");
                  $imgs.each(function (index, el) {
                     if (photos[index]) {
                        QUnit.ok$visible($(el));
                        QUnit.ok($(el).attr("src") === photos[index].photo);
                     } else {
                        QUnit.ok$hidden($(el));
                        QUnit.ok($(el).attr("src") === undefined);
                     }
                  });
               },
               nPhotos = 20,
               animationTime = 2000;
                  
           
           module("Gallery", {
              setup : function () {
                 $testBody
                    .empty()
                    .append($container);

                 gallery = new GalleryWidget(null, $container.get(0));
                 photos = testFixture.getPhotos(nPhotos);
              },
              teardown : function () {
                 $testBody.empty();
                 // Necessary to register the same widget id again.
                 gallery.destroyRecursive(false);
              }
           });

           QUnit.asyncTest("startup/loadPhotos", 6, function () {
              // No startup yet.
              QUnit.raiseError(gallery.run, gallery);
              QUnit.raiseError(gallery.load, gallery, photos);
              gallery.startup();
              // Multiple calls to startup
              gallery.startup();
              // Wait for the tooltip to fade in.
              // The time needs to be adjusted manually.  
              setTimeout(function () {
                 assertTooltipPresence(true);
                 // No args loadPhoto.
                 QUnit.raiseError(gallery.load, gallery);
                 gallery.load([]);
                 // Make sure the tooltip does not go away.
                 setTimeout(function() {
                    assertTooltipPresence(true);
                    gallery.load(photos);
                    // Make sure the tooltip does not go away.
                    setTimeout(function () {
                       assertTooltipPresence(true);
                       QUnit.start();
                    }, animationTime);
                 }, animationTime);
              }, animationTime);
           });

           QUnit.asyncTest("run", nPhotosInGalleryAssertions + 1,  function () {
              gallery.startup();
              gallery.load(photos);
              gallery.run();
              setTimeout(function () {
                 assertTooltipPresence(false);
                 assertPhotosInGallery(photos.slice(0, 5));
                 QUnit.start();
              }, animationTime);
           });

           QUnit.asyncTest("navigateIfNecessary", 4 * nPhotosInGalleryAssertions + 1, function () {
              gallery.startup();
              gallery.load(photos);
              gallery.run();
              setTimeout(function () {
                 // Should throw error without photo.
                 QUnit.raiseError(gallery.navigateIfNecessary, gallery, "false input");
                 // Should stay on the same page.
                 gallery.navigateIfNecessary(photos[4]);
                 setTimeout(function () {
                    assertPhotosInGallery(photos.slice(0, 5));
                    // Should s\tay on the same page.
                    gallery.navigateIfNecessary(photos[0]);
                    setTimeout(function () {
                       assertPhotosInGallery(photos.slice(0, 5));
                       // Should navigate.
                       gallery.navigateIfNecessary(photos[5]);
                       setTimeout(function () {
                          assertPhotosInGallery(photos.slice(5, 10));
                          // Should navigate.
                          gallery.navigateIfNecessary(photos[4]);
                          setTimeout(function () {
                             assertPhotosInGallery(photos.slice(0, 5));
                             QUnit.start();
                          }, animationTime);
                       }, animationTime);
                    }, animationTime);
                 }, animationTime);
              }, animationTime);
           });

           QUnit.asyncTest("reset", 1, function () {
              gallery.startup();
              gallery.load(photos);
              gallery.run();
              gallery.reset();
              setTimeout(function () {
                 assertTooltipPresence(true);
                 QUnit.start();
              }, animationTime);
           });

           QUnit.asyncTest("insertPhoto", 3 * nPhotosInGalleryAssertions + 1,  function () {
              var photos = testFixture.getPhotos(4),
                  photo5 = testFixture.getRandomPhoto(12),
                  photo6 = testFixture.getRandomPhoto(13),
                  photoIndex = 0,
                  newPhoto = null;
              console.log("Gallery: Starting insertPhoto test.");
              gallery.startup();
              gallery.load(photos);
              gallery.run();

              QUnit.raiseError(gallery.insertPhoto, gallery);
              gallery.insertPhoto(photo5);
              photos.push(photo5);
              setTimeout(function () {
                 // Make sure the image counter incremented properly.
                 assertPhotosInGallery(photos.slice(0, 5));
                 // This should navigate the gallery to 2nd page.
                 gallery.insertPhoto(photo6);
                 photos.push(photo6);
                 setTimeout(function () {
                    assertPhotosInGallery([photo6, null, null, null, null]);
                    for (photoIndex = 0; photoIndex < 19; photoIndex++) {
                       newPhoto = testFixture.getRandomPhoto(13 + photoIndex);
                       gallery.insertPhoto(newPhoto);
                       photos.push(newPhoto);
                    }
                    setTimeout(function () {
                       assertPhotosInGallery(photos.slice(20, 25));
                       QUnit.start();
                    }, animationTime);
                 }, animationTime);
              }, animationTime);
           });

           QUnit.asyncTest("deletePhoto", nPhotosInGalleryAssertions + 2, function () {
              var photos = testFixture.getPhotos(6),
                  oldPhoto = photos[5],
                  photoIndex = 0;

              gallery.startup();
              gallery.load(photos);
              gallery.run();

              QUnit.raiseError(gallery.deletePhoto, gallery);
              gallery.deletePhoto(oldPhoto);
              photos.splice(5, 6);
              setTimeout(function () {
                 // Make sure the image counter is decremented properly.
                 // Make sure the gallery navigates to the 2nd photo.
                 assertPhotosInGallery(photos.slice(0, 5));
                 for (photoIndex = 0; photoIndex < photos.length; photoIndex++) {
                    gallery.deletePhoto(photos[photoIndex]);
                 }
                 setTimeout(function () {
                    assertTooltipPresence(true);
                    QUnit.start();
                 }, 5000);
              }, animationTime);
           }, animationTime);

        });
           
