/*global main, define, $, TEMP_TITLE_KEY, TEMP_DESCRIPTION_KEY, UIInput, window*/
"use strict";


define(["dojo/_base/declare", "view/DetailView"], 
       function (declare, detailView) {
          return declare (null, {
             
             update : function (album) {
                var input = main.getUI().getInput();

                input.show({
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
                      detailView.update(album);
                   },
                   url : "/update-album",
                   context : this
                });
             },
             insert : function (event) {
                var instance = this,
                    input = main.getUI().getInput(),
                    state = main.getUIState();

                input.show({
                   load : function () {
                      $("input[name=lat]").val(event.lat);
                      $("input[name=lon]").val(event.lng);
                   },
                   submit : function () {
                      //get album name + description
                      var title = $("[name=title]").val(), 
                          description = $("[name=description]").val();
                      //dont create album yet, server might return error
                      state.store(TEMP_TITLE_KEY, title);
                      state.store(TEMP_DESCRIPTION_KEY, description);
                   },
                   success : function (data){
                      main.getUI().insertAlbum(event.lat, event.lng, data);
                   },
                   url : "/insert-album",
                   context : this
                });
             },
             delete : function (album) {
                var input = main.getUI().getInput();

                input.show({
                   type : UIInput.CONFIRM_DIALOG,
                   load : function () {
                      $("input[name='id']").val(album.id);
                      $("span#mp-dialog-album-title").text(album.title+"?");
                   },
                   success : function () {
                      main.getUI().deleteAlbum(album);
                   },
                   url : "/delete-album",
                   context : this
                });
             },
             share : function (album) {
                var input = main.getUI().getInput();

                input.show({
                   url : "/update-album-password",
                   load : function ()  {
                      $("input[name='album']").val(album.id);
                      $("input[name='share']").val("http://"+ window.location.host +"/album/view/"+album.secret+"-"+album.id);
                      // $("input[name='share']").val(
                      // copy to clipboard with jquery (zclip) using ZeroClipboard (javascript and flash)
                      $("#mp-copy-share").zclip({
                         path: 'static/js/zeroclipboard/zeroclipboard.swf',
                         copy: $("input[name='share']").val()
                      });
                   },
                   context : this,
                });
             }
          });
       });
