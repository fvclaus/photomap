// /*global require, $, QUnit*/

// "use strict";

// require(["widget/PhotoCarouselWidget",
//          "keiken/test/TestFixture",
//         "dojo/domReady!"],
//         function (PhotoCarouselWidget, TestFixture) {

//            var photoCarousel = null,
//                $testBody = $("#testBody"),
//                $container = $("<section id=mp-photocarousel><img style='height:100%;width:auto' /> </section>"),
//                testFixture = new TestFixture(),
//                photos = null,
//                assertTooltipPresence = function (present) {
//                   if (present) {
//                      QUnit.ok$visible($(".mp-tooltip"));
//                   } else {
//                      QUnit.ok$hidden($(".mp-tooltip"));
//                   }
//                },
//                assertPhotoInWidget = function (photo) {
//                   var $image = $(".mp-photoCarousel-image"),
//                       expectedText = "Photo " + (photos.indexOf(photo) + 1) +  "/" + photos.length;
//                   QUnit.ok$visible($image);
//                   QUnit.ok$text($(".mp-image-number"), expectedText);
//                   QUnit.ok(parseInt($image.attr("data-keiken-id")) === photo.id, "The slideshow image should display the photo with id " + photo.id);
//                },
//                animationTime = 1200;

                  

//            module("PhotoCarousel", {
//               setup : function () {
//                  $testBody
//                     .empty()
//                     .append($container);


//                  photos = testFixture.getPhotos(12);
//               },
//               teardown : function () {
//                  $testBody.empty();
//                  // Necessary to register the same widget id again.
//                  photoCarousel.destroyRecursive(false);
//               }
//            });
           
//            QUnit.asyncTest("startup/loadPhotos", 6, function () {
//                  photoCarousel = new PhotoCarouselWidget($container.find("img"), photos, "photo", ;
//               // No startup yet.
//               QUnit.raiseError(photoCarousel.run, photoCarousel);
//               QUnit.raiseError(photoCarousel.load, photoCarousel, photos);
//               photoCarousel.startup();
//               // Multiple calls to startup
//               photoCarousel.startup();
//               // Wait for the tooltip to fade in.
//               // The time needs to be adjusted manually.  
//               setTimeout(function () {
//                  assertTooltipPresence(true);
//                  // No args loadPhoto.
//                  QUnit.raiseError(photoCarousel.load, photoCarousel);
//                  photoCarousel.load([]);
//                  // Make sure the tooltip does not go away.
//                  setTimeout(function() {
//                     assertTooltipPresence(true);
//                     photoCarousel.load(photos);
//                     // Make sure the tooltip does not go away.
//                     setTimeout(function () {
//                        assertTooltipPresence(true);
//                        QUnit.start();
//                     }, 300);
//                  }, 300);
//               }, 300);
//            });

//            QUnit.asyncTest("run", 4,  function () {
//               photoCarousel.startup();
//               photoCarousel.load(photos);
//               photoCarousel.run();
//               setTimeout(function () {
//                  assertTooltipPresence(false);
//                  assertPhotoInWidget(photos[0]);
//                  QUnit.start();
//               }, animationTime);
//            });

//            QUnit.asyncTest("navigateWithDirection", 11, function () {
//               photoCarousel.startup();
//               photoCarousel.load(photos);
//               // navigateWithDirection is supposed to start the photoCarousel if it is not running yet.
//               photoCarousel.navigateWithDirection("right");
//               QUnit.raiseError(photoCarousel.navigateWithDirection, photoCarousel, 3);
//               QUnit.raiseError(photoCarousel.navigateWithDirection, photoCarousel, "wrong");
//               photoCarousel.navigateWithDirection("left");
//               setTimeout(function () {
//                  assertPhotoInWidget(photos[11]);
//                  photoCarousel.navigateWithDirection("right");
//                  setTimeout(function () {
//                     assertPhotoInWidget(photos[0]);
//                     photoCarousel.navigateWithDirection("right");
//                     photoCarousel.navigateWithDirection("right");
//                     photoCarousel.navigateWithDirection("right");
//                     photoCarousel.navigateWithDirection("right");
//                     setTimeout(function () {
//                        assertPhotoInWidget(photos[4]);
//                        QUnit.start();
//                     }, animationTime);
//                  }, animationTime);
//               }, animationTime);
//            });

//            QUnit.asyncTest("navigateTo", 7, function () {
//               photoCarousel.startup();
//               photoCarousel.load(photos);
//               // No parameter not legal.
//               QUnit.raiseError(photoCarousel.navigateTo, photoCarousel);
//               // This should be the same as photoCarousel.run()
//               photoCarousel.navigateTo(null);
//               setTimeout(function () {
//                  assertPhotoInWidget(photos[0]);
//                  photoCarousel.navigateTo(photos[7]);
//                  setTimeout(function () {
//                     assertPhotoInWidget(photos[7]);
//                     QUnit.start();
//                  }, animationTime);
//               }, animationTime);
//            });

//            QUnit.asyncTest("reset", 1, function () {
//               photoCarousel.startup();
//               photoCarousel.load(photos);
//               photoCarousel.run();
//               photoCarousel.reset();
//               setTimeout(function () {
//                  assertTooltipPresence(true);
//                  QUnit.start();
//               }, animationTime);
//            });

//            QUnit.asyncTest("insertPhoto", 10,  function () {
//               var newPhoto = testFixture.getRandomPhoto(12),
//                   photoIndex = 0;
//               photoCarousel.startup();
//               photoCarousel.load(photos);
//               photoCarousel.run();

//               QUnit.raiseError(photoCarousel.insertPhoto, photoCarousel);
              
//               photoCarousel.insertPhoto(newPhoto);
//               photos.push(newPhoto);
//               setTimeout(function () {
//                  // Make sure the image counter incremented properly.
//                  assertPhotoInWidget(photos[0]);
//                  photoCarousel.navigateTo(newPhoto);
//                  setTimeout(function () {
//                     assertPhotoInWidget(newPhoto);
//                     for (photoIndex = 0; photoIndex < 20; photoIndex++) {
//                        newPhoto = testFixture.getRandomPhoto(13 + photoIndex);
//                        photoCarousel.insertPhoto(newPhoto);
//                        photos.push(newPhoto);
//                     }
//                     setTimeout(function () {
//                        assertPhotoInWidget(photos[12]);
//                        QUnit.start();
//                     }, animationTime);
//                  }, animationTime);
//               }, animationTime);
//            });

//            QUnit.asyncTest("deletePhoto", 5, function () {
//               var oldPhoto = photos[0],
//                   photoIndex = 0;
//               photoCarousel.startup();
//               photoCarousel.load(photos);
//               photoCarousel.run();

//               QUnit.raiseError(photoCarousel.deletePhoto, photoCarousel);
              
//               photoCarousel.deletePhoto(oldPhoto);
//               photos.splice(0, 1);
//               setTimeout(function () {
//                  // Make sure the image counter is decremented properly.
//                  // Make sure the photoCarousel navigates to the 2nd photo.
//                  assertPhotoInWidget(photos[0]);
//                  for (photoIndex = 0; photoIndex < photos.length; photoIndex++) {
//                     photoCarousel.deletePhoto(photos[photoIndex]);
//                  }
//                  setTimeout(function () {
//                     assertTooltipPresence(true);
//                     QUnit.start();
//                  }, animationTime);
//               }, animationTime);
//            }, animationTime);
//         });

