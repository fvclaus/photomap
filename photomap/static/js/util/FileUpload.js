/*global $, main, FormData, ERRORS, ALLOWED_UPLOAD_FILE_TYPES, TEMP_TITLE_KEY, TEMP_DESCRIPTION_KEY, XMLHttpRequest */

"use strict";

var fileUpload, state, input, gallery, place, files, checked, data, request;

var FileUpload = function () {
   this.state = main.getUIState();
   this.input = main.getUI().getInput();
};

FileUpload.prototype =  {


   /**
    * @description Adds photo to UI after successful upload.
    * @param response response-text transform into a JSON-Oject
    * @param photo Photo-Object which was creates before starting the upload. Now properties given by the server can be added.
    */
   _responseHandler : function (response) {
      if (response.success) {
         main.getUI().addPhoto(response);
         main.getClientState().updateUsedSpace();
      
      } else {
         alert(response.error);
      }
   },

   /**
    * @description Get input-values of the request-form and transform them into a FormData-Object and start the upload.
    * @param {Boolean} repeat Repeat defines if the user wants to add more photos afterwards or not.
    */
   startUpload : function (photo) {

      var $form = $("form.jquery-validator"),  inputValues, state = main.getUIState();
      
      // Photo Upload funktioniert in Chrome! Man muss nur die internet-security (same-origin-policy) abschalten (komischerweise klappt es manchmal trotzdem nicht - ka warum!).. an sich muss man das bei FF auch damit der Upload ohne Probleme funktioniert. Ausserdem gilt das beides nur für die Entwicklung. Jeder der etwas auf den amazon-server hochladen will, dürfte damit eigentlich keine Probleme haben (egal welcher Browser .. sogar IE).
      //TODO wenn der UIPhotoEditor drinnen ist wird der Upload nicht mehr funktionieren da ich mozilla spezifische JS Funktionen benutzen muss

      // $.browser.chrome = /chrome/.test(navigator.userAgent.toLowerCase());
      // if ($.browser.chrome) {
      //    alert("Fileupload only works in FF");
      //    return;
      // }

      //validation is handled in UIPhotoListener.js

      inputValues = {
         'id' : $form.find("input[name='place']").val(),
         'title' : $form.find("input[name='title']").val(),
         'description' : $form.find("textarea[name='description']").val()
      };

      this.state.store(TEMP_TITLE_KEY, inputValues.title);
      this.state.store(TEMP_DESCRIPTION_KEY, inputValues.description);
         
      // get FormData-Object for Upload
      data = new FormData();

      data.append('place', inputValues.id);
      data.append('title', inputValues.title);
      data.append('description', inputValues.description);
      data.append("photo", photo);


      this.sendUpload(data);

   },
   /**
    * @description Upload the given FormData-Object to the server
    * @param {FormData} data FormData-Object with the file to upload and additional params.
    * @param file Photo-Object which was created prior Upload, given to response-Handler in order to add properties given by the server.
    */
   sendUpload : function (data) {

      var upload, instance = this;

      request = new XMLHttpRequest();
      upload = request.upload;
      this._bindUploadHandler(upload);

      request.onreadystatechange = function (e) {
         
         console.log(request.readyState);
         var text, error;

         // readyState === 4 -> data-transfer completed and response fully received
         if (request.readyState === 4) {
            if (request.status === 200 || request.status === 0) {
               console.log(JSON.parse(request.responseText));
               instance._responseHandler(JSON.parse(request.responseText));
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
   },
   /**
    @private
    */
   _bindUploadHandler : function (upload) {
      var instance = this;
      // handler called after upload is started
      upload.addEventListener('loadstart', function(event) {
         instance._startHandler.call(instance, event);
      });
      // handler for the upload progress
      upload.addEventListener('progress', function (event) {
         instance._progressHandler.call(instance, event);
      });
      // handler called after all bytes are sent
      upload.addEventListener('load', function (event) {
         instance._loadHandler.call(instance,event);
      });
   },
   /**
    * @description Open another File-Input-Form after current form is submitted, in case user wants to add more files.
    */
   _startHandler : function () {

      this.input.close();
      state.setFileToUpload(null);
   },
   /**
    * @description Simple upload-progress-tracker. Changes color of gallery-title. 
    */
   _progressHandler : function (event) {
      //TODO needs serious changing - mostly because it doesn't work anymore with new design.      
      //TODO how about: http://peter.sh/examples/?/html/meter-progress.html
   },
   _loadHandler : function () {
      console.log('Done');
   }
};

