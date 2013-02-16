/*global main, $, TEMP_TITLE_KEY, TEMP_DESCRIPTION_KEY, UIInput, window*/
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
            this._title = this.$title.val();
            this._description = this.$description.val();
         },
         success : function () {
            album.title = this._title;
            album.description = this._description;
            main.getUI().getInformation().updateAlbum();
         },
         url : "/update-album",
         context : this
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
         url : "/insert-album",
         context : this
      });
   },
   delete : function (album) {
      this.input.show({
         type : UIInput.CONFIRM_DIALOG,
         load : function () {
            $("input[name='id']").val(album.id);
         },
         success : function () {
            main.getUI().deleteAlbum(album);
         },
         url : "/delete-album",
         context : this
      });
   },
   share : function (album) {
      this.input.show({
         url : "/update-album-password",
         load : function ()  {
            $("input[name='album']").val(album.id);
            $("input[name='share']").val("http://"+ window.location.host +"/album/share/"+album.secret+"-"+album.id);
            // $("input[name='share']").val(
            // copy to clipboard with jquery (zclip) using ZeroClipboard (javascript and flash)
            $("#mp-copy-share").zclip({
               path: 'static/js/zeroclipboard/zeroclipboard.swf',
               copy: $("input[name='share']").val()
            });
         },
         context : this,
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
};
            
