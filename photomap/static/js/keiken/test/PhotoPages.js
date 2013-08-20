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

          QUnit.test("noPhotoEntry", function () {
             var pages = new PhotoPages([], 5, "thumb"),
                 currentPage = pages.getPage("first");

             currentPage.forEach(function (photo) {
                QUnit.ok(photo === null);
             });
          });

          QUnit.test("getIndex", function () {
             var photos = testFixture.getRandomPhotos(13),
                 pages = new PhotoPages(photos, 3, "thumb");

             QUnit.ok(pages.getPageIndex(photos[2]) === 0);
             QUnit.ok(pages.getLocalPhotoIndex(photos[2]) === 2);
             // Photo not on the current page.
             QUnit.ok(pages.getLocalPhotoIndex(photos[5]) === -1);
             QUnit.ok(pages.getCurrentPageIndex() === 0);
             QUnit.ok(pages.getPageIndex(photos[12]) === 4);
          });

          QUnit.test("passByReference", function () {
             var photos = testFixture.getRandomPhotos(5),
                 pages = new PhotoPages(photos, 5, "thumb"),
                 currentPage = pages.getPage("first");

             // Modify photo array.
             photos[0].id = 999;
             QUnit.ok(currentPage[0].id === 999);
          });

             
          QUnit.test("getPage", function () {
             var photos = testFixture.getRandomPhotos(13),
                 pages = new PhotoPages(photos, 1, "thumb"),
                 page = null;
             
             QUnit.ok(pages.getPage("first") === pages.getPage(0));
             QUnit.ok(pages.getPage("last") === pages.getPage(12));
             QUnit.ok(pages.getPage("next") === pages.getPage(0));
             QUnit.ok(pages.getPage("previous") === pages.getPage(12));
             QUnit.ok(pages.getPage("previous") === pages.getPage(11));
             QUnit.ok(pages.getPage("current") === pages.getPage(11));
             QUnit.ok(pages.getPage(photos[3]) === pages.getPage(3));
             QUnit.raiseError(pages.getPage, pages, 15);
          });

          QUnit.test("insertPhoto", function () {
             var photos = testFixture.getRandomPhotos(13),
                 photo = testFixture.getRandomPhoto(),
                 pages = new PhotoPages(photos, 5, "thumb"),
                 currentPage = pages.getPage("last");

             // Check that photos are added at the end.
             // Also make sure that pages in memory are updated correctly.
             QUnit.ok(currentPage[2] !== null && currentPage[3] === null);
             photos.push(photo);
             pages.insertPhoto(photo);
             QUnit.ok(photos.length === 14);
             QUnit.ok(currentPage[3] !== null && currentPage[4] === null);

             photos = [];
             pages = new PhotoPages(photos, 1, "thumb");
             currentPage = pages.getPage("first");
             QUnit.ok(currentPage[0] === null);
             photos.push(photo);
             QUnit.ok(photos.length === 1);
             pages.insertPhoto(photo);
             QUnit.ok(currentPage[0].getId() === photo.getId());
          });


          QUnit.test("deletePhoto", function () {
             var photos = testFixture.getRandomPhotos(13),
                 photo = testFixture.getRandomPhoto(),
                 pages = new PhotoPages(photos, 5, "thumb"),
                 currentPage = pages.getPage("last");

             // Check that photos will be removed and filled with null values.
             QUnit.ok(currentPage[2] === photos[12] && currentPage[3] === null);
             // Delete last photo
             photo = photos[12];
             photos.splice(12, 1);
             pages.deletePhoto(photo);
             QUnit.ok(photos.length === 12);
             QUnit.ok(currentPage[0] === photos[10] && currentPage[1] === photos[11] && currentPage[2] === null);
             QUnit.ok(currentPage.length === 5);

             // Delete second to last photo.
             photos = testFixture.getRandomPhotos(13);
             pages = new PhotoPages(photos, 2, "thumb");
             currentPage = pages.getPage("last");
             QUnit.ok(currentPage[0] === photos[12] && currentPage[1] === null);
             photo = photos[11];
             photos.splice(11, 1);
             pages.deletePhoto(photo);
             // Need to refresh the page, because page number 7 has been deleted.
             currentPage = pages.getPage("last"); // getPage(current) works too
             QUnit.ok(currentPage[0] === photos[10] && currentPage[1] === photos[11]);

             // Check that there will always remain one empty page.
             photo = testFixture.getRandomPhoto();
             photos = [photo];
             pages = new PhotoPages(photos, 1, "thumb");
             photos.splice(0, 1);
             pages.deletePhoto(photo);
             currentPage = pages.getPage("current");
             QUnit.ok(currentPage[0] === null);
             QUnit.ok(currentPage[0] === pages.getPage("last")[0]);

          });
       });

   
   
   