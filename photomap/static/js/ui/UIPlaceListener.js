/*global main, $, TEMP_TITLE_KEY, TEMP_DESCRIPTION_KEY, UIInput*/
"use strict";


var UIPlaceListener = function () {
   this.input = main.getUI().getInput();
   this.state = main.getUI().getState();
};

UIPlaceListener.prototype = {
   insert : function (event) {
      var instance = this,
          lat = event.lat,
          lng = event.lng;

      this.input.show({
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
            instance.state.store(TEMP_TITLE_KEY, instance.title);
            instance.state.store(TEMP_DESCRIPTION_KEY, instance.description);
         },
         success : function (data) {
            main.getUI().insertPlace(event.lat, event.lng, data);      
         },
         url : "/insert-place"
      });
   },
   update : function (place) {
      this.input.show({
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
            main.getUI().getInformation().updatePlace();
         },
         url : "/update-place"
      });
   },
   delete : function (place) {
      this.input.show({
         type : UIInput.CONFIRM_DIALOG,
         url: "/delete-place",
         data : {
            id : place.id,
            title : place.title,
            model : place.model
         }
      });
   },
   bindListener : function (place) {
      var instance = this, places, state, 
          editControls = main.getUI().getControls().getEditControls();
      state = main.getUIState();
      
      if (place !== undefined) {
         places = [place];
      } else {
         places = state.getPlaces();
      }
      places.forEach(function (place) {
         place.addListener("mouseover", function () {
            if (!main.getUI().isDisabled()) {
               editControls.show(place);
            }
         });
         place.addListener("mouseout", function () {
            editControls.hide(true);
         });
      });
   }
};
      