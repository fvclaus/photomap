/*global define, $, QUnit, steal*/

"use strict";

define(["dojo/_base/declare",
         "dojo/_base/lang",
         "../widget/AdminGalleryWidget",
         "./PhotoWidget",
         "../util/Communicator",
         "dojo/domReady!"],
        function (declare, lang, AdminGalleryWidget, PhotoWidgetTestCase, communicator) {

           var GalleryTest = declare([PhotoWidgetTestCase], {
              name : "AdminGallery",
              $containerTemplate : $("<section id=mp-full-left-column></section>"),
              PhotoWidget : AdminGalleryWidget,
              nPhotos : 20,
              photosInWidgetAssertions : 1,
              assertPhotosInWidget : function (photos) {
                  QUnit.ok(this.$testBody.find("img").length === photos.length);
               },
              testRunPhotoAssertions : 2,
              testRun : function () {
                 this.widget.startup();
                 QUnit.raiseError(this.widget.load, this.widget);
                 this.widget.load(this.photoCollection);
                 this.widget.run();
                 setTimeout(lang.hitch(this, function () {
                    this.assertPhotosInWidget(this.photos);
                    QUnit.start();
                 }), this.options.animationTime);
              },
              testDeletePhotoAssertions : 4,
              testDeletePhoto : function () {
                 this.widget.startup();
                 // delete photos without loading them
                 QUnit.raiseError(this.widget.deletePhoto, this.widget, this.photos[0]);
                 this.widget.load(this.photoCollection);
                 this.widget.run();
                 var photoIndex = 0,
                     oldPhoto = this.photos[0];
                 QUnit.raiseError(this.widget.deletePhoto, this.widget);
                 this.photoCollection["delete"](this.photos[0]);


                 setTimeout(lang.hitch(this, function () {
                    this.assertPhotosInWidget(this.photos);
                    for (photoIndex = this.photos.length - 1; photoIndex >= 0; photoIndex--) {
                       this.photoCollection["delete"](this.photos[0]);
                    }
                    setTimeout(lang.hitch(this, function () {
                       this.assertPhotosInWidget(this.photos);
                       QUnit.start();
                    }), this.options.animationTime);
                 }), this.options.animationTime);
              },

              testInsertPhotoAssertions : 3,
              testInsertPhoto :  function () {
                 this.widget.startup();
                 // insertPhoto without loading them
                 QUnit.raiseError(this.widget.insertPhoto, this.widget, this.photos.length);
                 this.widget.load(this.photoCollection);
                 this.widget.run();
                 var newPhoto = this.fixture.getRandomPhoto(this.photos.length);
                 QUnit.raiseError(this.widget.insertPhoto, this.widget);
                 this.photoCollection.insert(newPhoto);
                 setTimeout(lang.hitch(this, function () {
                    this.assertPhotosInWidget(this.photos);
                    QUnit.start();
                 }), this.options.animationTime);
              },
              testDragAssertions : 20 + 3, // nThis.Photos + 3
              testDrag : function () {
                 this.widget.startup();
                 this.widget.load(this.photoCollection);
                 this.widget.run();
                 setTimeout(lang.hitch(this, function () {
                    var $imgs = this.$testBody.find("img"),
                        $img0 = $imgs.eq(0),
                        $img1 = $imgs.eq(1),
                        img0Pos = $img0.position(),
                        img1Pos = $img1.position();
                    
                    communicator.subscribeOnce("changed:PhotoOrder", 
                                               lang.hitch(this, function (photos) {
                                                  QUnit.ok(this.photos instanceof Array);
                                                  photos.forEach(function (photo, index) {
                                                     QUnit.ok(photo.order > -1);
                                                     if (index === 0) {
                                                        QUnit.ok(photo.order === 1);
                                                     } else if (index === 1) {
                                                        QUnit.ok(photo.order === 0);
                                                     }
                                                  });
                                                  QUnit.start();
                                               }));
                    


                    $img1.simulate("drag", {
                       dx : img0Pos.left  - (img1Pos.left + $img1.width()),
                       dy : img0Pos.top - img1Pos.top
                       // handle : "center"
                       // moves : 10
                    });
                 }), 2 * this.options.animationTime);
              }
           }),
               test = new GalleryTest({ animationTime : 1000});

           test.run();
        });
