/*global require, $, QUnit, steal*/

"use strict";

require(["widget/AdminGalleryWidget",
         "keiken/test/TestFixture",
         "util/Communicator",
         "dojo/domReady!"],
        function (AdminGalleryWidget, TestFixture, communicator) {
           var gallery = null,
               $testBody = $("#testBody"),
               $container = $("<section id=mp-full-left-column></section>"),
               testFixture = new TestFixture(),
               photos = null,
               photoCollection = null,
               assertPhotosInGallery = function (photos) {
                  QUnit.ok($testBody.find("img").length === photos.length);
               },
               nPhotos = 20;
                  
           
           module("AdminGallery", {
              setup : function () {
                 $testBody
                    .empty()
                    .append($container);

                 gallery = new AdminGalleryWidget(null, $container.get(0));
                 photoCollection = testFixture.getRandomPhotoCollection(nPhotos);
                 photos = photoCollection.getAll();
              },
              teardown : function () {
                 $testBody.empty();
                 // Necessary to register the same widget id again.
                 gallery.destroyRecursive(false);
              }
           });
           

           QUnit.asyncTest("run", 2, function () {
              gallery.startup();
              QUnit.raiseError(gallery.load, gallery);
              gallery.load(photoCollection);
              gallery.run();
              setTimeout(function () {
                 assertPhotosInGallery(photos);
                 QUnit.start();
              }, 1000);
           });

           QUnit.asyncTest("deletePhoto", 4, function () {
              gallery.startup();
              // deletePhotos without loading them
              QUnit.raiseError(gallery.deletePhoto, gallery, photos[0]);
              gallery.load(photoCollection);
              gallery.run();
              var photoIndex = 0,
                  oldPhoto = photos[0];
              QUnit.raiseError(gallery.deletePhoto, gallery);
              photoCollection.delete(photos[0]);


              setTimeout(function () {
                 assertPhotosInGallery(photos);
                 for (photoIndex = photos.length - 1; photoIndex >= 0; photoIndex--) {
                    photoCollection.delete(photos[0]);
                 }
                 setTimeout(function () {
                    assertPhotosInGallery(photos);
                    QUnit.start();
                 }, 1000);
              }, 1000);
           });

           QUnit.asyncTest("insertPhoto", 3, function () {
              gallery.startup();
              // insertPhoto without loading them
              QUnit.raiseError(gallery.insertPhoto, gallery, testFixture.getRandomPhoto(photos.length));
              gallery.load(photoCollection);
              gallery.run();
              var newPhoto = testFixture.getRandomPhoto(photos.length);
              QUnit.raiseError(gallery.insertPhoto, gallery);
              photoCollection.insert(newPhoto);
              setTimeout(function () {
                 assertPhotosInGallery(photos);
                 QUnit.start();
              }, 1000);
           });

           QUnit.asyncTest("drag", nPhotos + 3, function () {
              gallery.startup();
              gallery.load(photoCollection);
              gallery.run();
              setTimeout(function () {
                 var $imgs = $testBody.find("img"),
                     $img0 = $imgs.eq(0),
                     $img1 = $imgs.eq(1),
                     img0Pos = $img0.position(),
                     img1Pos = $img1.position();
                 
                 communicator.subscribeOnce("change:photoOrder", 
                                        function (photos) {
                                           QUnit.ok(photos instanceof Array);
                                           photos.forEach(function (photo, index) {
                                              QUnit.ok(photo.order > -1);
                                              if (index === 0) {
                                                 QUnit.ok(photo.order === 1);
                                              } else if (index === 1) {
                                                 QUnit.ok(photo.order === 0);
                                              }
                                           });
                                           QUnit.start();
                                        });
                 


                 $img1.simulate("drag", {
                    dx : img0Pos.left  - (img1Pos.left + $img1.width()),
                    dy : img0Pos.top - img1Pos.top,
                    // handle : "center"
                    // moves : 10
                 });
              }, 2000);
           });
        });
