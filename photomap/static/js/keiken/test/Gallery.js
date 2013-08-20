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
               photoCollection = null,
               assertTooltipPresence = function (present) {
                  var $infoText = $(".mp-infotext");
                  if (present) {
                     QUnit.ok$visible($infoText);
                  } else {
                     QUnit.ok($infoText.length === 0 || $infoText.is(":hidden"));
                  }
               },
               nPhotosInGalleryAssertions = 10,
               assertPhotosInGallery = function (photos) {
                  var $imgs = $testBody.find(".mp-thumb");
                  $imgs.each(function (index, el) {
                     if (photos[index]) {
                        QUnit.ok$visible($(el));
                        QUnit.ok($(el).attr("src") === photos[index].thumb);
                     } else {
                        QUnit.ok$hidden($(el));
                        QUnit.ok($(el).attr("src") === undefined);
                     }
                  });
               },
               nPhotos = 20,
               animationTime = 2200;
                  
           
           module("Gallery", {
              setup : function () {
                 $testBody
                    .empty()
                    .append($container);

                 gallery = new GalleryWidget(null, $container.get(0));
                 photoCollection = testFixture.getRandomPhotoCollection(nPhotos);
                 photos = photoCollection.getAll();
              },
              teardown : function () {
                 $testBody.empty();
                 // Necessary to register the same widget id again.
                 gallery.destroyRecursive(false);
              }
           });

           QUnit.asyncTest("startup/loadPhotos", 7, function () {
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
                 // Wrong input
                 QUnit.raiseError(gallery.load, gallery, photos);
                 gallery.load(testFixture.getRandomPhotoCollection(0));
                 // Make sure the tooltip does not go away.
                 setTimeout(function() {
                    assertTooltipPresence(true);
                    gallery.load(photoCollection);
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
              gallery.load(photoCollection);
              gallery.run();
              setTimeout(function () {
                 assertTooltipPresence(false);
                 assertPhotosInGallery(photos.slice(0, 5));
                 QUnit.start();
              }, animationTime);
           });

           QUnit.asyncTest("navigateIfNecessary", 4 * nPhotosInGalleryAssertions + 1, function () {
              gallery.startup();
              gallery.load(photoCollection);
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
              gallery.load(photoCollection);
              gallery.run();
              gallery.reset();
              setTimeout(function () {
                 assertTooltipPresence(true);
                 QUnit.start();
              }, animationTime);
           });

           QUnit.asyncTest("insertPhoto", 3 * nPhotosInGalleryAssertions + 1,  function () {
              var photoCollection = testFixture.getRandomPhotoCollection(4),
                  photos = photoCollection.getAll(),
                  photo5 = testFixture.getRandomPhoto(12),
                  photo6 = testFixture.getRandomPhoto(13),
                  photoIndex = 0,
                  newPhoto = null;
              console.log("Gallery: Starting insertPhoto test.");
              gallery.startup();
              gallery.load(photoCollection);
              gallery.run();

              QUnit.raiseError(gallery.insertPhoto, gallery);
              photoCollection.insert(photo5);


              setTimeout(function () {
                 // Make sure the image counter incremented properly.
                 assertPhotosInGallery(photos.slice(0, 5));
                 // This should navigate the gallery to 2nd page.
                 photoCollection.insert(photo6);
                 setTimeout(function () {
                    assertPhotosInGallery([photo6, null, null, null, null]);
                    for (photoIndex = 0; photoIndex < 19; photoIndex++) {
                       newPhoto = testFixture.getRandomPhoto(13 + photoIndex);
                       photoCollection.insert(newPhoto);
                    }
                    setTimeout(function () {
                       assertPhotosInGallery(photos.slice(20, 25));
                       QUnit.start();
                    }, animationTime);
                 }, animationTime);
              }, animationTime);
           });

           QUnit.asyncTest("deletePhoto", nPhotosInGalleryAssertions + 2, function () {
              var photoCollection = testFixture.getRandomPhotoCollection(6),
                  photos = photoCollection.getAll(),
                  oldPhoto = photos[5],
                  photoIndex = 0,
                  nPhotos = photos.length;

              gallery.startup();
              gallery.load(photoCollection);
              gallery.run();

              QUnit.raiseError(gallery.deletePhoto, gallery);
              photoCollection.delete(photos[5]);

              setTimeout(function () {
                 // Make sure the image counter is decremented properly.
                 // Make sure the gallery navigates to the 2nd photo.
                 assertPhotosInGallery(photos.slice(0, 5));
                 nPhotos = photos.length;
                 for (photoIndex = 0; photoIndex < nPhotos; photoIndex++) {
                    photoCollection.delete(photos[0]);
                 }
                 setTimeout(function () {
                    assertTooltipPresence(true);
                    QUnit.start();
                 }, 5000);
              }, animationTime);
           }, animationTime);

        });
           
