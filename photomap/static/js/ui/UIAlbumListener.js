/*global main, $, TEMP_TITLE_KEY, TEMP_DESCRIPTION_KEY*/
"use strict";

var UIAlbumListener = function () {
   this.input = main.getUI().getInput();
   this.state = main.getUI().getState();
};

UIAlbumListener.prototype = {

   update : function (album) {

      this.input.show({
         load : function () {
            $("input[name=id]").val(album.id);
            this.$title = $("input[name=title]").val(album.title);
            this.$description = $("textarea[name=description]").val(album.description);
         },
         submit : function () {
            //reflect changes locally
            album.title = this.$title.val();
            album.description = this.$description.val();
         },
         url : "/update-album"
      });
   },
   insert : function (event) {
      var instance = this;

      this.input.show({
         load : function () {
            $("input[name=lat]").val(event.lat);
            $("input[name=lon]").val(event.lng);
         },
         submit : function () {
            //get album name + description
            var title = $("[name=title]").val(), description = $("[name=description]").val();
            //dont create album yet, server might return error
            instance.state.store(TEMP_TITLE_KEY, title);
            instance.state.store(TEMP_DESCRIPTION_KEY, description);
         },
         success : function (data){
            main.getUI().addAlbum(event.lat, event.lng, data);
         },
         url : "/insert-album"
      });
   },
   delete : function (album) {
      this.input.showDeleteDialog("/delete-album", {
         id : album.id,
         title : album.title,
         model : album.model
      });
   },
   bindListener : function (album) {
            
      var instance = this, albums, state,
          editControls = main.getUI().getControls().getEditControls();
      state = main.getUIState();
      
      if (album !== undefined) {
         albums = [album];
      } else {
         albums = state.getAlbums();
      }
      albums.forEach(function (album) {
         album.addListener("mouseover", function () {
            if (!main.getUI().isDisabled()) {
               editControls.show(album);
            }
         });
         album.addListener("mouseout", function () {
            editControls.hide(true);
         });
      });
   },
 
}
            
