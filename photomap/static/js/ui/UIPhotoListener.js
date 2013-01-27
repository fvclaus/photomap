/*global main, $, TEMP_TITLE_KEY, TEMP_DESCRIPTION_KEY, FileUpload, UIPhotoEditor */
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

      this.input.show({  
         submitHandler: function () {
            //bind listener for form submit and file change
            instance._submitHandler.call(instance);
         },
         url : "/insert-photo?place=" + place.id
      });
   },
   handleDrop : function (event) {
      //TODO whats that for?
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
      $("#file-input").bind('change', function(event) {
         instance.editor.edit.call(instance.editor, event);
      });
      
   },
   update : function (photo) {
      var instance = this;
      this.input.show({
         load : function () {
            //prefill with values from selected picture
            $("input[name=id]").val(photo.id);
            $("input[name=order]").val(photo.order);
            instance.$title = $("input[name=title]").val(photo.title);
            instance.$description = $("textarea[name=description]").val(photo.description);
         },
         submit : function () {
            //reflect changes locally
            photo.title = instance.$title.val();
            photo.description = instance.$description.val();
         },
         url : "/update-photo"
      });
   },
   delete : function (photo) {
      this.input.showDeleteDialog("/delete-photo", {
         id : photo.id,
         title : photo.title,
         model : photo.model
      });
   },

};