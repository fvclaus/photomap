/*global main, define, $, TEMP_TITLE_KEY, TEMP_DESCRIPTION_KEY, CONFIRM_DIALOG*/
"use strict";



define(["dojo/_base/declare", "presenter/Presenter", "util/Communicator", "ui/UIState"],
       function (declare, Presenter, communicator, state) {

          return declare(Presenter, {
             constructor : function () {
                communicator.subscribe("processed:photo", this._insertPhoto, this);
                communicator.subscribe("delete:photo", this._deletePhoto, this);
                communicator.subscribe("processed:place", this._insertPlace, this);
                communicator.subscribe("delete:place", this._deletePlace, this);
             },
             insert : function (event) {
                var instance = this,
                    input = main.getUI().getInput(),
                    lat = event.lat,
                    lng = event.lng;

                input.show({
                   load : function () {
                      var title, description;
                      $("input[name=lat]").val(lat);
                      $("input[name=lon]").val(lng);
                      $("input[name=album]").val(state.getCurrentLoadedAlbum().id);
                   },
                   submit : function () {
                      //get place name + description
                      instance.title = $("[name=title]").val();
                      instance.description = $("[name=description]").val();
                      //dont create place yet, server might return error
                      state.store(TEMP_TITLE_KEY, instance.title);
                      state.store(TEMP_DESCRIPTION_KEY, instance.description);
                   },
                   success : function (data) {
                      data.lng = lng;
                      data.lat = lat;
                      communicator.publish("insert:place", data);
                   },
                   url : "/insert-place",
                   context : this
                });
             },
             update : function (place) {
                var input = main.getUI().getInput();
                input.show({
                   load : function () {
                      $("input[name=id]").val(place.id);
                      this.$title = $("input[name=title]").val(place.title);
                      this.$description = $("textarea[name=description]").val(place.description);
                   },
                   submit : function () {
                      //save changes
                      this._title = this.$title.val();
                      this._description = this.$description.val();
                   },
                   success : function () {
                      place.title = this._title;
                      place.description = this._description;
                      communicator.publish("change:place", place);
                   },
                   url : "/update-place",
                   context : this
                });
             },
             delete : function (place) {
                var input = main.getUI().getInput();
                input.show({
                   type : CONFIRM_DIALOG,
                   load : function () {
                      $("input[name='id']").val(place.id);
                      $("span#mp-dialog-place-title").text(place.title + "?");
                   },
                   success : function () {
                      communicator.publish("delete:place", place);
                   },
                   url: "/delete-place",
                   context : this
                });
             },
             _insertPhoto : function (photo) {
                state.getCurrentLoadedPlace().insertPhoto(photo);
             },
             _deletePhoto : function (photo) {
                state.getCurrentLoadedPlace().deletePhoto(photo);
             },
             _insertPlace : function (place) {
                place.show();
                place.openPlace();
             },
             _deletePlace : function (place) {
                place.hide();
                state.deletePlace(place);
             }
          });
       });
