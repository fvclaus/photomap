/*global $, define, QUnit*/


"use strict";


define(["util/PhotoPages",
        "keiken/test/TestFixture",
        "model/Photo"],
       function (PhotoPages, TestFixture, Photo) {
          var testFixture = new TestFixture();

          module("PhotoPages",  {});

          QUnit.test("multiplePhotosEntry", function () {
             var photos = testFixture.getRandomPhotos(13),
                 pages = new PhotoPages(photos, 5, "photo"),
                 currentPage = pages.getPage("current"),
                 otherPage = pages.getPage(0);
             // Check general page properties like length.
             QUnit.ok(currentPage.length === 5);
             QUnit.ok(otherPage.length === currentPage.length);
             QUnit.ok(pages.isFirstPage());
             // Check that sources from the first page match.
             currentPage.forEach(function (photo, photoIndex) {
                QUnit.ok(photo.isInstanceOf(Photo));
                QUnit.ok(photo.getId() === otherPage[photoIndex].getId());
                QUnit.ok(photo.getId() === photoIndex);
             });

             otherPage = pages.getPage(2);
             QUnit.ok(pages.isLastPage());
             QUnit.ok(otherPage[3] === null && otherPage[4] === null);
             // Check PhotoPages with one entry.
             pages = new PhotoPages(photos, 1, "photo");
             QUnit.ok(!pages.isLastPage());
             currentPage = pages.getPage(12);
             QUnit.ok(currentPage.length === 1);
             QUnit.ok(pages.isLastPage());
          });


          QUnit.test("singlePhotoEntry", function () {
             var photo = testFixture.getRandomPhoto(),
                 pages = new PhotoPages([photo], 5, "thumb"),
                 currentPage = pages.getPage("first");
             
             QUnit.ok(currentPage.length === 5);

             currentPage.forEach(function (photo, index) {
                if (index === 0) {
                   QUnit.ok(photo !== null);
                } else {
                   QUnit.ok(photo === null);
                }
             });
             
             QUnit.ok(pages.isLastPage());
          });


          QUnit.test("addPhoto", function () {
             var photos = testFixture.getRandomPhotos(13),
                 photo = testFixture.getRandomPhoto(),
                 pages = new PhotoPages(photos, 5, "thumb"),
                 currentPage = pages.getPage("last");

             // Check that photos are added at the end.
             QUnit.ok(currentPage[2] !== null && currentPage[3] === null);
             pages.insertPhoto(photo);
             currentPage = pages.getPage("current");
             QUnit.ok(currentPage[3] !== null && currentPage[4] === null);

             pages = new PhotoPages([], 1, "thumb");
             currentPage = pages.getPage("first");
             QUnit.ok(currentPage[0] === null);
             pages.insertPhoto(photo);
             currentPage = pages.getPage("current");
             QUnit.ok(currentPage[0].getId() === photo.getId());
          });


          QUnit.test("deletePhoto", function () {
             var photos = testFixture.getRandomPhotos(13),
                 photo = testFixture.getRandomPhoto(),
                 pages = new PhotoPages(photos, 5, "thumb"),
                 currentPage = pages.getPage("last");

             // Check that photos will be removed and filled with null values.
             QUnit.ok(currentPage[2] !== null && currentPage[3] === null);
             // Delete last photo.
             pages.deletePhoto(photos[photos.length - 1]);
             currentPage = pages.getPage("current");
             QUnit.ok(currentPage[0] !== null && currentPage[1] !== null && currentPage[2] === null);
             QUnit.ok(currentPage.length === 5);

             // Delete second to last photo.
             pages = new PhotoPages(photos, 2, "thumb");
             currentPage = pages.getPage("last");
             QUnit.ok(currentPage[0].getId() === photos[photos.length - 1].getId() && currentPage[1] === null);
             pages.deletePhoto(photos[photos.length - 2]);
             currentPage = pages.getPage("last"); // getPage(current) works too
             QUnit.ok(currentPage[0].getId() === photos[photos.length - 3].getId() && currentPage[1].getId() !== photos[photos.length - 2].getId());

             // Check that there will always remain one empty page.
             photo = testFixture.getRandomPhoto();
             pages = new PhotoPages([photo], 1, "thumb");
             pages.deletePhoto(photo);
             currentPage = pages.getPage("current");
             QUnit.ok(currentPage[0] === null);
             QUnit.ok(currentPage[0] === pages.getPage("last")[0]);

          });
       });

   
   
   