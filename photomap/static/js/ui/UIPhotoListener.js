/*global main, $, TEMP_TITLE_KEY, TEMP_DESCRIPTION_KEY, FileUpload, UIPhotoEditor, UIInput */
"use strict";


var UIPhotoListener = function () {
   this.input = main.getUI().getInput();
   this.state = main.getUI().getState();
   this.fileUpload = new FileUpload();
   this.editor = new UIPhotoEditor();
};


//TODO this has no effect. we are using jquery validator plugin now
$.tools.validator.fn("[type=file]", function (el, value) {
   return (/\.(jpg|png)$/i).test(value) ? true : "only jpg or png allowed";
});

UIPhotoListener.prototype = {
   insert : function () {
      var instance = this,
         place = this.state.getCurrentLoadedPlace();
      
      // if-clause to prevent method from being executed if there are no places yet
      if (main.getUIState().getPlaces().length !== 0) {
         this.input.show({
            submitHandler: function () {
               //bind listener for form submit and file change
               instance._submitHandler.call(instance);
            },
            url : "/insert-photo?place=" + place.id
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
      $("#insert-photo-tabs").tabs();
      $("form.jquery-validator").validate({
         success : "valid",
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
         url : "/update-photo"
      });
   },
   delete : function (photo) {
      this.input.show({
         type : UIInput.CONFIRM_DIALOG,
         url: "/delete-photo",
         data : {
            id : photo.id,
            title : photo.title,
            model : photo.model
         }
      });
   },

};