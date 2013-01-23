/*jslint windows: true */
/*global $, main, FormData, ERRORS, ALLOWED_UPLOAD_FILE_TYPES, Photo */

"use strict";

/**
 * file-upload.js
 * @author Marc Römer
 * @description Complete (Html5 +XMLHttpRequest Level 2 + jQuery) - File Upload with DnD-Handlers
 */

var fileUpload, state, input, gallery, place, files, checked, data, request, usedSpace, quota, toMbyte, BYTE_TO_MBYTE = Math.pow(2, 20);

fileUpload = {

   handleGalleryDragover : function (event) {
      event.stopPropagation();
      event.preventDefault();
      event.originalEvent.dataTransfer.dropEffect = 'copy';
   },
   /**
    * @description Called when file dropped into gallery. If DnD fully supported and file ok, file will get set up for upload and input-form will open.
    */
   handleGalleryDrop : function (event) {

      var hideInput;

      event.stopPropagation();
      event.preventDefault();

      state = main.getUIState();
      input = main.getUI().getInput();
      place = state.getCurrentLoadedPlace();
      files = event.originalEvent.dataTransfer.files;
      checked = fileUpload.checkFiles(files);

      // check for file api support of the browser
      if (window.File && window.FileReader && window.FileList && window.Blob) {
         if (checked.success) {
            // handler for gallery drop
            state.setFileToUpload(files[0]);
            hideInput = function () {
               $("input[type='file'],label[name='file-upload']").remove();
            };
            input.getUpload("/insert-photo?place=" + place.id, hideInput);
         } else {
            alert(checked.error);
            return false;
         }
      } else {
         alert(ERRORS.NO_FILE_API_SUPPORT);
         return false;
      }
      return true;
   },
   /**
    * @description Called when input[type='file'] field changes. Empties input-field if file is not ok, else file gets set up for upload.
    */
   handleFileInput : function (event) {
      event.preventDefault();
      event.stopPropagation();

      state = main.getUIState();
      place = state.getCurrentLoadedPlace();
      files = event.target.files;
      checked = fileUpload.checkFiles(files);

      if (checked.success) {
         state.setFileToUpload(files[0]);
      } else {
         $("input[type='file']").val(null);
         alert(checked.error);
      }
      return;
   },
   /**
    * @description Open another File-Input-Form after current form is submitted, in case user wants to add more files.
    */
   _startHandler : function () {
      state = main.getUIState();
      input = main.getUI().getInput();

      input.close();
      state.setFileToUpload(null);
      if (state.isMultipleUpload()) {
         $(".mp-option-add").trigger('click');
      }
      state.setMultipleUpload(false);
   },
   /**
    * @description Simple upload-progress-tracker. Changes color of gallery-title.
    */
   _progressHandler : function (event) {

      var percentageUploaded, factor, rgbBgColor, rgbFontColor;

      if (event.lengthComputable) {
         percentageUploaded = Math.round(event.loaded / event.total);
         if (percentageUploaded <= 50) {
            factor = (percentageUploaded * 2);
            rgbBgColor = 255 * factor;
            rgbFontColor = 255 - rgbBgColor;
            $(".mp-gallery-title-bar").css({
               'background-color': 'rgba(' + rgbBgColor + ',' + rgbBgColor + ',' + rgbBgColor + ',.6)',
               'color': 'rgba(' + rgbFontColor + ',' + rgbFontColor + ',' + rgbFontColor + ',1)'
            });
         } else {
            factor = ((percentageUploaded - 50) * 2);
            rgbFontColor = 255 * factor;
            rgbBgColor = 255 - rgbFontColor;
            $(".mp-gallery-title-bar").css({
               'background-color': 'rgba(' + rgbBgColor + ',' + rgbBgColor + ',' + rgbBgColor + ',.6)',
               'color': 'rgba(' + rgbFontColor + ',' + rgbFontColor + ',' + rgbFontColor + ',1)'
            });
         }
         console.log('Upload-Status: ' + percentageUploaded + '%');
      }
   },
   _loadHandler : function () {
      $(".mp-gallery-title-bar").css({
         'background-color': '#333',
         'color': '#FFF'
      });
      console.log('Done');
   },
   /**
    * @description Adds photo to UI after successful upload.
    * @param response response-text transform into a JSON-Oject
    * @param photo Photo-Object which was creates before starting the upload. Now properties given by the server can be added.
    */
   _responseHandler : function (response, photo) {
      state = main.getUIState();
      gallery = main.getUI().getGallery();
      if (response.success) {
         // add received value to uploadedPhoto-Object, add the photo to current place and restart gallery
         photo.source = response.url;
         photo.id = response.id;
         photo.order = state.getPhotos().length;
         photo.thumb = response.thumb;
         console.log(photo);
         state.getCurrentLoadedPlace().addPhoto(photo);
         main.getClientState().updateUsedSpace();
      
      } else {
         alert(response.error);
      }
   },
   /**
    * @description Takes files and checks them for validity.
    */
   checkFiles : function (files) {

      var result;

      if (files.length > 1) {
         // return if more than one file is dropped into the gallery
         result = {
            'success' : false,
            'error' : ERRORS.TOO_MANY_PHOTOS
         };
      } else if (!files[0].type || $.inArray(files[0].type, ALLOWED_UPLOAD_FILE_TYPES) < 0) {
         // return if the file type is not allowed
         result = {
            'success' : false,
            'error' : ERRORS.UNALLOWED_FILE_TYPE
         };
      } else {
         // if everything is correct proceed
         result = {
            'success' : true
         };
      }

      return result;

   },
   /**
    * @description Create a request object, that is compatible to Microsoft IE and other browsers.
    */
   _createRequest : function () {
      // a lil compatibility with microsoft
      try {
         request = new XMLHttpRequest();
      } catch (tryNewerMicrosoft) {
         try {
            request = new ActiveXObject("Msxml2.XMLHTTP");
         } catch (tryOlderMicrosoft) {
            try {
               request = new ActiveXObject("Microsoft.XMLHTTP");
            } catch (failed) {
               request = false;
            }
         }
      }

      if (!request) {
         alert(ERRORS.NO_XHR2_SUPPORT);
      }

      return request;
   },
   /**
    * @description Take params and create a FormData-Object with them.
    * @param: params Parameters of the request.
    * @param: {String} fileType Type of the file upload-file (eg. "photo").
    */
   getUploadData : function (params, fileType) {
      state = main.getUIState();
      data = new FormData();

      data.append('place', params.id);
      data.append('title', params.title);
      data.append('description', params.description);
      data.append(fileType, state.getFileToUpload());

      return data;
   },
   /**
    * @description Get input-values of the request-form and transform them into a FormData-Object and start the upload.
    * @param {Boolean} repeat Repeat defines if the user wants to add more photos afterwards or not.
    */
   startUpload : function (repeat) {

      var $form, formValidator, inputValues, photo;

      $.browser.chrome = /chrome/.test(navigator.userAgent.toLowerCase());
      if ($.browser.chrome) {
         alert("Fileupload only works in FF");
         return;
      }

      $form = $("form.mp-dialog");
      formValidator = $form.validator({
         formEvent: null,
         messageClass: "mp-form-error",
         position: "bottom center"
      }).data('validator');

      if (formValidator.checkValidity()) {

         if (repeat) {
            state.setMultipleUpload(true);
         }
         // get input values
         inputValues = {
            'id' : $form.find("input[name='place']").val(),
            'title' : $form.find("input[name='title']").val(),
            'description' : $form.find("textarea[name='description']").val()
         };

         // add new photo object and set first values -> finished in responseHandler
         photo = new Photo(inputValues);

         // get FormData-Object for Upload
         data = fileUpload.getUploadData(inputValues, 'photo');

         fileUpload.sendUpload(data, photo);

      } else {
         alert("Bitte überprüfen Sie nochmal das Formular. Name und Bild müssen angegeben sein.");
      }
   },
   /**
    * @description Upload the given FormData-Object to the server
    * @param {FormData} data FormData-Object with the file to upload and additional params.
    * @param file Photo-Object which was created prior Upload, given to response-Handler in order to add properties given by the server.
    */
   sendUpload : function (data, file) {

      var upload;

      request = fileUpload._createRequest();
      if (!request) {
         return;
      }
      upload = request.upload;
      if (!upload) {
         alert(ERRORS.NO_XHR2_SUPPORT);
         return;
      }

      // handler called after upload is started
      upload.addEventListener('loadstart', fileUpload._startHandler);
      // handler for the upload progress
      upload.addEventListener('progress', fileUpload._progressHandler);
      // handler called after all bytes are sent
      upload.addEventListener('load', fileUpload._loadHandler);
      request.onreadystatechange = function (e) {
         
         console.log(request.readyState);
         var text, error;

         // readyState === 4 -> data-transfer completed and response fully received
         if (request.readyState === 4) {
            if (request.status === 200 || request.status === 0) {
               // console.log(request.responseText);
               console.log(JSON.parse(request.responseText));
               fileUpload._responseHandler(JSON.parse(request.responseText), file);
            } else {
               // alert error if upload wasn't successful
               if (request.responseText) {
                  text = JSON.parse(request.responseText);
               } else {
                  text = "No responseText.";
               }
               if (request.status) {
                  error = request.status;
               } else {
                  error = "No error.";
               }
               alert("The upload didn't work. Error: " + error + " - Response-Text: " + text);
            }
         }
      };
      request.open('post', '/insert-photo', true);
      request.send(data);
   }
};

/**
* Emulate FormData Object for some browsers
* MIT License
* (c) 2010 François de Metz
*/
(function (w) {
   if (w.FormData) {
      return;
   }
   function FormData() {
      this.boundary = "--------FormData" + Math.random();
      this._fields = [];
   }
   FormData.prototype.append = function (key, value) {
      this._fields.push([key, value]);
   };
   FormData.prototype.toString = function () {
      var body, boundary;
      boundary = this.boundary;
      body = "";
      this._fields.forEach(function (field) {
         body += "--" + boundary + "\r\n";
         // file upload
         if (field[1].name) {
            var file = field[1];
            body += "Content-Disposition: form-data; name=\"" + field[0] + "\"; filename=\"" + file.name + "\"\r\n";
            body += "Content-Type: " + file.type + "\r\n\r\n";
            body += file.getAsBinary() + "\r\n";
         } else {
            body += "Content-Disposition: form-data; name=\"" + field[0] + "\";\r\n\r\n";
            body += field[1] + "\r\n";
         }
      });
      body += "--" + boundary + "--";
      return body;
   };
   w.FormData = FormData;
})(window);
