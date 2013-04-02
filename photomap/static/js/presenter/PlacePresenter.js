/*global main, $, TEMP_TITLE_KEY, TEMP_DESCRIPTION_KEY, UIInput*/
"use strict";


var PlacePresenter = function () {
};

PlacePresenter.prototype = {
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
            main.getUI().insertPlace(event.lat, event.lng, data);      
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
            main.getUI().getInformation().update(place);
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
            $("span#mp-dialog-place-title").text(place.title+"?");
         },
         success : function () {
            main.getUI().deletePlace(place);
         },
         url: "/delete-place",
         context : this,
      });
   }
};
      