/*global main, define, $, TEMP_TITLE_KEY, TEMP_DESCRIPTION_KEY, UIInput*/
"use strict";



define(["dojo/_base/declare"],
       function (declare) {

          return declare(null, {
             initialize : function () {
                var communicator = main.getCommunicator();
                communicator.subscribe("processed:photo", this._insertPhoto, this);
                communicator.subscribe("delete:photo", this._deletePhoto, this);
                communicator.subscribe("processed:place", this._insertPlace, this);
                communicator.subscribe("delete:place", this._deletePlace, this);
             },
             insert : function (event) {
                var instance = this,
                    state = main.getUIState(),
                    input = main.getUI().getInput(),
                    lat = event.lat,
                    lng = event.lng;

                input.show({
                   load : function () {
                      var title, description;
                      $("input[name=lat]").val(lat);
                      $("input[name=lon]").val(lng);
                      $("input[name=album]").val(main.getUIState().getCurrentLoadedAlbum().id);
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
                      main.getCommunicator().publish("insert:place", data);
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
                      main.getCommunicator().publish("change:place", place);
                   },
                   url : "/update-place",
                   context : this
                });
             },
             delete : function (place) {
                var input = main.getUI().getInput();
                input.show({
                   type : UIInput.CONFIRM_DIALOG,
                   load : function () {
                      $("input[name='id']").val(place.id);
                      $("span#mp-dialog-place-title").text(place.title + "?");
                   },
                   success : function () {
                      main.getCommunicator().publish("delete:place", place);
                   },
                   url: "/delete-place",
                   context : this
                });
             },
             _insertPhoto : function (photo) {
                main.getUIState().getCurrentLoadedPlace().insertPhoto(photo);
             },
             _deletePhoto : function (photo) {
                main.getUIState().getCurrentLoadedPlace().deletePhoto(photo);
             },
             _insertPlace : function (place) {
                place.show();
                place.openPlace();
             },
             _deletePlace : function (place) {
                place.hide();
                main.getUIState().deletePlace(place);
             }
          });
       });
