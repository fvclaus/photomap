/*global $, PhotoPresenter*/

"use strict";


var GalleryPresenter = function () {
   this.photoPresenter = new PhotoPresenter();
};

GalleryPresenter.prototype = {
   
   /**
    * @public
    * @see UIAlbum
    */
   insert : function () {
      //TODO use method on Gallery --> Gallery.addListener(...)
      var instance = this,
         insertPhotoListener = function () {
            instance.photoListener.insert.call(instance.photoListener);
         };

      this.$insert.on("click.PhotoMap", insertPhotoListener);
   }
}