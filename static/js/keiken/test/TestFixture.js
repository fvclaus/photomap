/*global define, window, assertNumber, assertString, assertEqual*/

"use strict";

define([
   "dojo/_base/declare",
   "../model/Photo",
   "../model/Collection"
],
   function (declare, Photo, Collection) {
      return declare(null, {
         _lipsum : "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
         _photos : ["photo1.jpg", "photo2.jpg", "photo3.jpg", "photo4.jpg", "photo5.jpg", "photo6.jpg", "photo7.jpg"],
         constructor : function () {
            this._words = this._lipsum.split(" ");
         },
         getRandomPhotos : function (nPhotos) {
            assertNumber(nPhotos, "nPhotos must be of type Number.");
            var photos = [],
                photoIndex = 0;
            for (photoIndex = 0; photoIndex < nPhotos; photoIndex++) {
               photos.push(this.getRandomPhoto(photoIndex));
            }
            assertEqual(photos.length, nPhotos);
            return photos;
         },
         getRandomPhotoCollection : function (nPhotos) {
            var photos = this.getRandomPhotos(nPhotos);
            return new Collection(photos, Photo, {
               modelConstructor : Photo,
               modelType : "Photo"});
         },
         /*
          * @public
          * @description Returns a new photo with a random title/description.
          * The photo will be picked randomly from the test image folder.
          * @param {Number} id
          */
         getRandomPhoto : function (id) {
            if (id === null || id === undefined) {
               console.warn("Did not provide Id for test photo. Using random one.");
               id = parseInt(Math.random() * 1000, 10);
            }
            var photoAndThumb = this._getRandomPhotoAndThumb(),
                nWordsTitle = parseInt(Math.random() * 20, 10),
                nWordsDescription = parseInt(Math.random() * 300, 10),
                title = this._generateString(nWordsTitle),
                description = this._generateString(nWordsDescription);
            return new Photo({
               photo : photoAndThumb.photo,
               thumb : photoAndThumb.thumb,
               "title" : title,
               "description" : description,
               "id" : id
            });
         },
         /*
          * @private
          * @description Returns a random photo and its thumb from the test image folder.
          */
         _getRandomPhotoAndThumb : function () {
            var photo = this._photos[parseInt(Math.random() * this._photos.length + 1, 10) - 1];
            return {
               "photo" : this._toUrl(photo),
               "thumb" : this._toUrl(photo)
            };
         },
         /*
          * @private
          * @description Generates a sentence with the given number of words.
          * @param {Number} nWords
          */
         _generateString : function (nWords) {
            var wordIndex = 0,
                word = "";
            for (wordIndex = 0; wordIndex < nWords; wordIndex++) {
               word += this._getRandomWord();
               word += " ";
            }
            word += ".";
            return word;
         },
         /*
          * @private
          * @description Gets a random word from the standard lipsum.
          */
         _getRandomWord : function () {
            return this._words[parseInt(Math.random() * this._words.length + 1, 10) - 1];
         },
         /*
          * @private
          * @description Returns the absolute url to the file in the test image folder.
          * @param {String} fileName
          */
         _toUrl : function (fileName) {
            assertString(fileName, "fileName must be of type String.");
            return window.location.origin + "/static/test/" + fileName;
         }
      });
   });
