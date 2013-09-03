/*global define, $, QUnit*/

"use strict";

define(["../widget/PhotoCarouselWidget",
         "./TestFixture",
         "../model/Photo",
        "dojo/domReady!"],
        function (PhotoCarouselWidget, TestFixture, Photo) {

           var photoCarousel = null,
               $testBody = $("#testBody"),
               $container = null,
               testFixture = new TestFixture(),
               photos = null,
               photo = null,
               nPhotos = 12,
               $photos = null,
               n$photos = 5,
               assertTooltipPresence = function (present) {
                  if (present) {
                     QUnit.ok$visible($(".mp-tooltip"));
                  } else {
                     QUnit.ok$hidden($(".mp-tooltip"));
                  }
               },
               assertPhotosInWidget = function (photos, from) {
                  if (typeof from !== "number") {
                     from = 0;
                  }
                  photos.forEach(function(photo, index) {
                     if (photo) {
                        QUnit.ok(parseInt($photos.eq(index + from).attr("data-keiken-id"), 10) === photo.getId());
                     } else {
                        QUnit.ok($photos.eq(index + from).attr("src") === undefined);
                     }
                  });
               },
               animationTime = 1700,
               nExpectedAssertions = 0,
               nExpected$photos = 0,
               expectedPhotos = null,
               $photoIndex = 0,
               disableAssertions = false,
               getExpectedAssertionsForOneLoad = function () {
                  return nExpectedAssertions + n$photos;
               },
               afterLoad = null,
               onUpdate = null;

           module("PhotoCarousel", {
              setup : function () {
                 $container = $("<section id=mp-photocarousel style='height:100%; width=100%'> </section>");

                 for ($photoIndex = 0; $photoIndex < n$photos; $photoIndex++) {
                    $container.append("<div style='width:" + (parseInt(100/n$photos, 10) - 1) + "%; height:30%; border:2px solid black; float:left'> <img style='max-width:90%; max-height:90%; left:5%; top:5%; position:relative'/> <div/>");
                 }
                 
                 $testBody
                    .empty()
                    .append($container);

                 photos = testFixture.getRandomPhotos(nPhotos);
                 $photos = $container.find("img");

                 nExpectedAssertions = (n$photos * 4) + 3;
                 // The following are functions that can be used by a testcase to add some extra assertions.
                 // Reset after every testcase to avoid cross talk.
                 afterLoad = null;
                 onUpdate = null;

                 photoCarousel = new PhotoCarouselWidget($photos, photos, "photo", {
                    effect : "flip",
                    beforeLoad : function ($photos) {
                       if (disableAssertions) {
                          return;
                       }
                       // Photo elements might or might not be hidden, depending on the previous page.
                       QUnit.ok($photos.length === expectedPhotos.length);
                    },
                    afterLoad : function ($photos) {
                       if (typeof afterLoad === "function") { afterLoad.call(); }
                       if (disableAssertions) {
                          return;
                       }
                       QUnit.ok($photos.length === expectedPhotos.length);
                       // After loading, all photo elements must be hidden, because they have been faded out already.
                       expectedPhotos.forEach(function (photo, index) {
                          QUnit.ok$hidden($photos.eq(index));
                       });

                    },
                    onUpdate : function ($photos, $photosWithError) {
                       if (typeof onUpdate === "function") { onUpdate.call(); }

                       if (disableAssertions) {
                          return;
                       } else if ($photos.length === 0) { // This is triggered on insert/delete events to update text content.
                          return;
                       }
                          
                       QUnit.ok($photos.length === expectedPhotos.length);
                       $photosWithError.each(function () {
                          var $photo = $(this);
                          QUnit.ok($photo.attr("data-keiken-error"));
                          QUnit.ok($photo.attr("data-keiken-id"));
                          QUnit.ok($photo.attr("src") === undefined);
                       });
                       // After updating, a photo element must be visible, if it has valid src.
                       expectedPhotos.forEach(function (photo, index) {
                          var $photo = $photos.eq(index);
                          if (photo) {
                             QUnit.ok(typeof $photo.attr("src") === "string");
                             QUnit.ok(typeof parseInt($photo.attr("data-keiken-id"), 10) === "number");
                          } else {
                             QUnit.ok($photo.attr("src") === undefined);
                             QUnit.ok($photo.attr("data-keiken-id") === undefined);
                          }
                          QUnit.ok($photo.attr("data-keiken-error") === undefined);
                       });
                    }
                 });
              },
              teardown : function () {
                 $testBody.empty();
                 // Necessary to register the same widget id again.
                 // photoCarousel.destroyRecursive(false);
              }
           });



           QUnit.asyncTest("start", function () {
              // Test wrong input.
              QUnit.raiseError(photoCarousel.start, photoCarousel, true);
              QUnit.raiseError(photoCarousel.start, photoCarousel, testFixture.getRandomPhoto());
              nExpected$photos = 5;
              expectedPhotos = photos.slice(0, 5);
              // Start without parameter.
              photoCarousel.start();
              setTimeout(function () {
                 assertPhotosInWidget(expectedPhotos);
                 // Start with a certain photo.
                 photoCarousel.start(photos[4]);
                 setTimeout(function () {
                    assertPhotosInWidget(expectedPhotos);
                    // Stay on the same page.
                    photoCarousel.start(photos[2]);
                    setTimeout(function () {
                       assertPhotosInWidget(expectedPhotos);
                       // Stress test
                       expectedPhotos = photos.slice(5, 10);
                       disableAssertions = true;
                       photoCarousel.start(photos[5]);
                       photoCarousel.start(photos[6]);
                       photoCarousel.start(photos[7]);
                       setTimeout(function () {
                          assertPhotosInWidget(expectedPhotos);
                          QUnit.start();
                       }, animationTime);
                    }, animationTime);
                 }, animationTime);
              }, animationTime);
           });

           QUnit.asyncTest("navigateTo",  function () {

              nExpected$photos = 5;
              // Two successive load cycles.
              disableAssertions = true;
              photoCarousel.navigateTo(photos[1]);
              // Wrong input
              QUnit.raiseError(photoCarousel.navigateTo, photoCarousel, "back");
              QUnit.raiseError(photoCarousel.navigateTo, photoCarousel, null);
              photoCarousel.navigateTo(photoCarousel.getNPages() - 1);
              setTimeout(function() {
                 assertPhotosInWidget([photos[10], photos[11], null, null, null]);
                 // No successive calls from now on.
                 disableAssertions = false;
                 expectedPhotos = photos.slice(0, 5);
                 photoCarousel.navigateTo(0);
                 setTimeout(function () {
                    assertPhotosInWidget(expectedPhotos);
                    // Must stay on the same page.
                    photoCarousel.navigateTo(photos[3]);
                    setTimeout(function () {
                       assertPhotosInWidget(expectedPhotos);
                       expectedPhotos = photos.slice(5, 10);
                       // Must navigate to the next page.
                       photoCarousel.navigateTo(photos[7]);
                       setTimeout(function () {
                          assertPhotosInWidget(expectedPhotos);
                          QUnit.start();
                       }, animationTime);
                    }, animationTime);
                 }, animationTime);
              }, animationTime);
           });
           
           QUnit.asyncTest("networkError", function () {
              photos[0].photo = "Thisdoesnotexist";
              expectedPhotos = photos.slice(0, 5);
              onUpdate = function () {
                 expectedPhotos = photos.slice(1, 5);
                 onUpdate= null;
              };
              photoCarousel.start();
              setTimeout(function() {
                 QUnit.ok($photos.eq(0).attr("data-keiken-error"));
                 expectedPhotos = photos.slice(5, 10);
                 photoCarousel.navigateRight();
                 setTimeout(function () {
                    QUnit.ok($photos.eq(0).attr("data-keiken-error") === undefined);
                    QUnit.start();
                 },  animationTime);
              },  animationTime);
           });
           /*
            * Try to trigger two onUpdate events for "one" load.
            * After the photos have been loaded, navigate again.
            * This might cause the carousel to trigger onUpdate, when the second update cycle is fading out the photos.
            */
           QUnit.asyncTest("updateCycle", function () {
              var nUpdates = 0,
                  nAfterLoads = 0;
              expectedPhotos = photos.slice(0, 5);
              photoCarousel.start();
              // After load signals that the photos are fading in again.
              // Navigate left only on the first event to avoid looping.
              afterLoad = function () {
                 if (nAfterLoads === 0) {
                    // Wait till the animation begins.
                    setTimeout(function () {
                       photoCarousel.navigateRight();
                    }, 100);
                 }
                 nAfterLoads += 1;
              };
              // Allow only one update. The first update should be stopped, as the second one starts loading.
              onUpdate = function () {
                 nUpdates += 1;
                 QUnit.ok(nUpdates === 1);
              };
              setTimeout(function () {
                 QUnit.start();
              }, 2 * animationTime);
           });
           QUnit.asyncTest("insertPhoto", function () {
              // Wrong input.
              QUnit.raiseError(photoCarousel.insertPhoto, photoCarousel, {});
              // Insert on the last page. Easy.
              photo = testFixture.getRandomPhoto();
              photos.push(photo);
              photoCarousel.insertPhoto(photo);
              expectedPhotos = [photos[10], photos[11], photos[12], null, null];
              // Navigate to the last page.
              photoCarousel.navigateTo(photoCarousel.getNPages() - 1);
              setTimeout(function () {
                 // Check that photo was inserted on last page.
                 assertPhotosInWidget(expectedPhotos);
                 photo = testFixture.getRandomPhoto();
                 expectedPhotos = [photo];
                 // Insert on the current page. Expect reload.
                 photos.push(photo);
                 photoCarousel.insertPhoto(photo);
                 setTimeout(function() {
                    assertPhotosInWidget(expectedPhotos, 3);
                    // Navigate away from the last page.
                    // navigateLeft is not tested in this testcase.
                    disableAssertions = true;
                    photoCarousel.navigateLeft();
                    setTimeout(function () {
                       // There is no public way to change the options after instantiation.
                       // Check that the carousel navigates to the last page on insertion.
                       photoCarousel.options.navigateToInsertedPhoto = true;
                       disableAssertions = false;
                       photo = testFixture.getRandomPhoto();
                       expectedPhotos = [photos[10], photos[11], photos[12], photos[13], photo];
                       photos.push(photo);
                       photoCarousel.insertPhoto(photo);
                       setTimeout(function () {
                          assertPhotosInWidget(expectedPhotos);
                          QUnit.start();
                       }, animationTime);
                    }, animationTime);
                 }, animationTime);
              }, animationTime);
           });

           QUnit.asyncTest("deletePhoto", function () {
              // Wrong input.
              QUnit.raiseError(photoCarousel.deletePhoto, photoCarousel, {});
              // Delete from the last page. Easy.
              photo = photos.pop();
              expectedPhotos = [photos[10], null, null, null, null];
              photoCarousel.deletePhoto(photo);
              // Navigate to the last page.
              photoCarousel.navigateTo(photoCarousel.getNPages() - 1);
              setTimeout(function () {
                 // Check that photo was deleted from last page.
                 assertPhotosInWidget(expectedPhotos);
                 // Delete the last photo from current page. Expect navigate left.
                 photo = photos.pop();
                 expectedPhotos = photos.slice(5, 10);
                 photoCarousel.deletePhoto(photo);
                 setTimeout(function() {
                    assertPhotosInWidget(expectedPhotos);
                    // Delete the first photo from current page.
                    photo = photos[5];
                    photos.splice(5, 1);
                    expectedPhotos = [photos[5], photos[6], photos[7], photos[8], null];
                    photoCarousel.deletePhoto(photo);
                    setTimeout(function () {
                       assertPhotosInWidget(expectedPhotos);
                       QUnit.start();
                    }, 2 * animationTime); // Deleting from page. Needs additional 500 for fadingout.
                 }, 2 *  animationTime);
              }, animationTime);
           });
           // Bug that caused the Widget to crash when inserting on first page without photos and withou calling starting before.
           QUnit.test("insertOnFirstPage", function() {
              QUnit.expect(0);
              // Remove photos
              photos.splice(0, nPhotos);
              photoCarousel.update(photos);
              photos.push(testFixture.getRandomPhoto());
              photoCarousel.insertPhoto(photos[0]);
           });

           QUnit.asyncTest("update", function () {
              expectedPhotos = photos.slice(0, 5);
              photoCarousel.start();
              setTimeout(function () {
                 photo = photos[0];
                 // Change the order of the first & and second photo.
                 photos[0] = photos[1];
                 photos[1] = photo;
                 expectedPhotos = photos.slice(0, 5);
                 photoCarousel.update(photos);
                 setTimeout(function() {
                    assertPhotosInWidget(expectedPhotos);
                    QUnit.start();
                 }, animationTime);
              }, animationTime);
           });
              
        });
           
