/*global $, test, assertNumber, Photo, PhotoPages, ok, notEqual*/


"use strict";


function createPhotos (size) {
   assertNumber(size);
   var photoIndex = 0,
       photos = [];

   for (photoIndex = 0; photoIndex < size; photoIndex++) {
      photos.push(new Photo({
         "photo" : "photo" + photoIndex,
         "thumb" : "thumb" + photoIndex,
         "title" : "title" + photoIndex
      }));
   }

   return photos;
}


test("PhotoPages.testMultiplePhotos", function () {
   var photos = createPhotos(13),
       pages = new PhotoPages(photos, 5, "photo"),
       currentPage = pages.getPage("current"),
       otherPage = pages.getPage(0);

   ok(currentPage.length === 5);
   ok(otherPage.length === currentPage.length);
   ok(pages.isFirstPage());

   currentPage.forEach(function (photoSrc, photoIndex) {
      ok(typeof photoSrc === "string");
      ok(photoSrc === otherPage[photoIndex]);
   });

   otherPage = pages.getPage(2);
   ok(pages.isLastPage());
   ok(otherPage[3] === null && otherPage[4] === null);



   pages = new PhotoPages(photos, 1, "photo");
   ok(!pages.isLastPage());
   currentPage = pages.getPage(12);
   ok(currentPage.length === 1);
   ok(pages.isLastPage());
});


test("PhotoPages.testSinglePhoto", function () {
   var photo = createPhotos(1),
       pages = new PhotoPages(photo, 5, "thumb"),
       currentPage = pages.getPage("first");

   ok(currentPage.length === 5);

   currentPage.forEach(function (photoSrc, index) {
      if (index === 0) {
         ok(photoSrc !== null);
      } else {
         ok(photoSrc === null);
      }
   });
 
   ok(pages.isLastPage());
});


test("PhotoPages.addPhoto", function () {
   var photos = createPhotos(13),
       pages = new PhotoPages(photos, 5, "thumb"),
       currentPage = pages.getPage("last");

   // assume that photos will be added at the end
   ok(currentPage[2] !== null && currentPage[3] === null);
   pages.insertPhoto(createPhotos(1)[0]);
   currentPage = pages.getPage("current");
   ok(currentPage[3] !== null && currentPage[4] === null);

   pages = new PhotoPages([], 1, "thumb");
   currentPage = pages.getPage("first");
   ok(currentPage[0] === null);
   pages.insertPhoto(createPhotos(1)[0]);
   currentPage = pages.getPage("current");
   ok(currentPage[0] === createPhotos(1)[0].thumb);
});


test("PhotoPages.deletePhoto", function () {
   var photos = createPhotos(13),
       pages = new PhotoPages(photos, 5, "thumb"),
       currentPage = pages.getPage("last");

   // assume that photos will be removed and filled up with null values
   ok(currentPage[2] !== null && currentPage[3] === null);
   pages.deletePhoto(photos[photos.length - 1]);
   currentPage = pages.getPage("current");
   ok(currentPage[0] !== null && currentPage[1] !== null && currentPage[2] === null);
   ok(currentPage.length === 5);

   // assume that currentpage moved back one page
   pages = new PhotoPages(photos, 2, "thumb");
   currentPage = pages.getPage("last");
   // delete the only photo from the last page
   pages.deletePhoto(photos[photos.length - 1]);
   currentPage = pages.getPage("current");
   ok(currentPage[0] !== photos[photos.length - 3] && currentPage[1] !== photos[photos.length - 3]);

   // assume that there will always remain one empty page
   photos = createPhotos(1);
   pages = new PhotoPages(photos, 1, "thumb");
   pages.deletePhoto(photos[0]);
   currentPage = pages.getPage("current");
   ok(currentPage[0] === null);
   ok(currentPage[0] === pages.getPage("last")[0]);

});

   
   
   