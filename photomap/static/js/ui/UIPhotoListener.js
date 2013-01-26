/*global main, $, TEMP_TITLE_KEY, TEMP_DESCRIPTION_KEY, FileUpload*/
"use strict";


var UIPhotoListener = function () {
   this.input = main.getUI().getInput();
   this.state = main.getUI().getState();
   this.fileUpload = new FileUpload();
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
      event.stopPropagation();
      event.preventDefault();

      var files = event.originalEvent.dataTransfer.files,
          checked = this.fileUpload.checkFiles(files),
          instance = this,
          place = this.state.getCurrentLoadedPlace();
      
      if (checked.success) {
         // handler for gallery drop
         this.state.setFileToUpload(files[0]);

         this.input.show({
            submitHandler : function () {
               //hide input fields
               $("input[type='file'],label[name='file-upload']").remove();
               instance._submitHandler.apply(instance);
            },
            url : "/insert-photo?place=" + place.id
         });
      } else {
         alert(checked.error);
         return false;
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
         submitHandler : function () {
            instance.fileUpload.startUpload.call(instance.fileUpload);
         }
      });
      if ($("input#file-input")) {
         $("#file-input").bind('change', function(event) {
            instance.fileUpload.handleFileInput.call(instance.fileUpload, event);
         });
      }    
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