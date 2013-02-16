/*global main, $, TEMP_TITLE_KEY, TEMP_DESCRIPTION_KEY,  UIPhotoEditor, UIInput, FormData */
"use strict";


var UIPhotoListener = function () {
   this.input = main.getUI().getInput();
   this.state = main.getUI().getState();
   this.editor = new UIPhotoEditor();
};

UIPhotoListener.prototype = {
   insert : function () {
      var instance = this,
         place = this.state.getCurrentLoadedPlace();
      
      // if-clause to prevent method from being executed if there are no places yet
      if (main.getUIState().getPlaces().length !== 0) {
         this.input.show({
            load : function () {      
               $("#insert-photo-tabs").tabs();
               $("input[name='place']").val(place.id);
               this.$title = $("input[name='title']");
               this.$description = $("input[name='description']");
               //start the editor
               $("#file-input").bind('change', function (event) {
                  instance.editor.edit.call(instance.editor, event);
               });
            },
            submit: function () {
               this.state.store(TEMP_TITLE_KEY, this.$title.val());
               this.state.store(TEMP_DESCRIPTION_KEY, this.$description.val());
            },
            data : function () {
               var data = new FormData();
               data.append('place', place.id);
               data.append('title', this.$title.val());
               data.append('description', this.$description.val());
               data.append("photo", this.editor.getAsFile());

               return data;
            },
            success : function (data) {
               main.getUI().insertPhoto(data);
            },
            url : "/insert-photo",
            context : this
         });
      }
   },
   handleDrop : function (event) {
      //TODO whats that for? -> If you mean the stopPropagation etc. -> prevents the event from bubbling up the dom tree and triggering the default action, which is loading the pic into the browser - else you may have to explain the "that" ;) 
      //Whats wrong with letting the element bubble?
      event.stopPropagation();
      event.preventDefault();

      var file = this.editor._checkFile(event),
         instance = this,
         place = this.state.getCurrentLoadedPlace();
      
      if (file) {
         this.input.show({
            submitHandler : function () {
               //hide input fields
               instance._submitHandler.apply(instance);
               $("input[type='file']").trigger("change", event);
               $("input[type='file'],label[name='file-upload']").remove();
            },
            url : "/insert-photo?place=" + place.id
         });
      }
   },
   handleDrag : function (event) {
      event.stopPropagation();
      event.preventDefault();
      event.originalEvent.dataTransfer.dropEffect = 'copy';
   },
   _submitHandler : function () {
      var instance = this;

      $("form.jquery-validator").validate({
         success : "valid",
         rules : {
            photo : {
               accept : "image/png, image/jpeg"
            }
         },
         errorPlacement : function () {}, //don't show any errors
         submitHandler : function () {
            //give the fileupload the img data
            instance.fileUpload.startUpload.call(instance.fileUpload, instance.editor.getAsFile());
         }
      });
      //start the editor
      $("#file-input").bind('change', function (event) {
         instance.editor.edit.call(instance.editor, event);
      });

      
   },
   update : function (photo) {

      this.input.show({
         load : function () {
            //prefill with values from selected picture
            $("input[name=id]").val(photo.id);
            $("input[name=order]").val(photo.order);
            this.$title = $("input[name=title]").val(photo.title);
            this.$description = $("textarea[name=description]").val(photo.description);
         },
         submit : function () {
            //store them
            this._title = this.$title.val();
            this._description = this.$description.val();
         },
         success : function (data) {
            photo.title = this._title;
            photo.description = this._description;
            main.getUI().getInformation().updatePhoto();
         },
         url : "/update-photo",
         context : this
      });
   },
   delete : function (photo) {
      this.input.show({
         type : UIInput.CONFIRM_DIALOG,
         load : function () {
            $("input[name='id']").val(photo.id);
            $("span#mp-dialog-photo-title").text(photo.title+"?");
         },
         success : function (data) {
            main.getUI().deletePhoto(photo);
         },
         url: "/delete-photo",
         context : this
      });
   },

};