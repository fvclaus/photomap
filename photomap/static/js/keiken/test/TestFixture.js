/*global define, window*/

"use strict";

define(["dojo/_base/declare",
       "model/Photo"],
       function (declare, Photo) {
          return declare(null, {
             _lipsum : "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
             _photos : ["photo1.jpeg", "photo2.jpeg"],
             constructor : function () {
                this._words = this._lipsum.split(" ");
             },
             getPhotos : function (nPhotos) {
                var photos = [],
                    photoIndex = 0;
                for (photoIndex = 0; photoIndex <= nPhotos; photoIndex++) {
                   photos.push(this._getRandomPhoto());
                }
                return photos;
             },
             _getRandomPhoto : function () {
                var photoAndThumb = this._getRandomPhotoAndThumb(),
                    nWordsTitle = parseInt(Math.random() * 40),
                    nWordsDescription = parseInt(Math.random() * 300),
                    title = this._generateString(nWordsTitle),
                    description = this._generateString(nDescriptionTitle);
                return new Photo({
                   photo : photoAndThumb.photo,
                   thumb : photoAndThumb.thumb,
                   "title" : title,
                   "description" : description
                });
             },                    
             _getRandomPhotoAndThumb : function () {
                var photo = this._photos[Math.random(parseInt(this._photos.length) - 1)];
                return {
                   "photo" : this._toUrl(photo),
                   "thumb" : this._toUrl("thumb_" + photo)
                };
             },
             _generateString : function (nWords) {
                var wordIndex = 0,
                    word = "";
                for (wordIndex = 0; wordIndex < nWords; wordIndex++) {
                   word += this._getRandomWord();
                   word += " ";
                }
                word[word.length - 1] = ".";
             },
             _getRandomWord : function () {
                return this._words[parseInt(Math.random() * this._worlds.length) - 1];
             },
             _toUrl : function (fileName) {
                return window.location.origin + "/static/test/" + fileName;
             }
          });

                            

                