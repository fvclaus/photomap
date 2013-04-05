/*global main, define, $, TEMP_TITLE_KEY, TEMP_DESCRIPTION_KEY, CONFIRM_DIALOG, window*/
"use strict";


define(["dojo/_base/declare", "util/Communicator"],
        function (declare, communicator) {
           return declare(null, {

              constructor : function () {
                 communicator.subscribe("processed:album", this._insertAlbum, this);
                 communicator.subscribe("delete:album", this._deleteAlbum, this);
              },
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
                       communicator.publish("change:album", album);
                    },
                    url : "/update-album",
                    context : this
                 });
              },
              insert : function (event) {
                 var instance = this,
                     input = main.getUI().getInput(),
                     state = main.getUIState(),
                     lat = event.lat,
                     lng = event.lng;

                 input.show({
                    load : function () {
                       $("input[name=lat]").val(lat);
                       $("input[name=lon]").val(lng);
                    },
                    submit : function () {
                       //get album name + description
                       var title = $("[name=title]").val(),
                           description = $("[name=description]").val();
                       //dont create album yet, server might return error
                       state.store(TEMP_TITLE_KEY, title);
                       state.store(TEMP_DESCRIPTION_KEY, description);
                    },
                    success : function (data) {
                       data.lng = lng;
                       data.lat = lat;
                       communicator.publish("insert:album", data);
                    },
                    url : "/insert-album",
                    context : this
                 });
              },
              delete : function (album) {
                 var input = main.getUI().getInput();

                 input.show({
                    type : CONFIRM_DIALOG,
                    load : function () {
                       $("input[name='id']").val(album.id);
                       $("span#mp-dialog-album-title").text(album.title + "?");
                    },
                    success : function () {
                       communicator.publish("delete:album", album);
                    },
                    url : "/delete-album",
                    context : this
                 });
              },
              share : function (album) {
                 var input = main.getUI().getInput();

                 input.show({
                    url : "/update-album-password",
                    load : function () {
                       $("input[name='album']").val(album.id);
                       $("input[name='share']").val("http://" + window.location.host + "/album/view/" + album.secret + "-" + album.id);
                       // $("input[name='share']").val(
                       // copy to clipboard with jquery (zclip) using ZeroClipboard (javascript and flash)
                       $("#mp-copy-share").zclip({
                          path: 'static/js/zeroclipboard/zeroclipboard.swf',
                          copy: $("input[name='share']").val()
                       });
                    },
                    context : this
                 });
              },
              _insertAlbum : function (album) {
                 album.show();
                 album.openURL();
              },
              _deleteAlbum : function (album) {
                 album.hide();
                 main.getUIState().deleteAlbum(album);
              }
           });
        });
                          
