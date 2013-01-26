/*jslint */
/*global $, main, mpEvents */

"use strict";

/**
 * @author Frederik Claus
 * @class Handles any form of input. Takes care of form validation,error handling and closing the input dialog
 */

var UIInput, dimension, $formWrapper, html;

$.extend($.ui.dialog.prototype.options, {
   autoOpen: true,
   title: "Change Dialog",
   modal: true,
   zIndex: 3000,
   draggable: false,
});

UIInput = function () {
   this.dialog = $("#input-dialog");
   this.visible = false;
   this.$deleteDialog = $("#confirm-delete");
};
UIInput.prototype = {
   /**
    * @author Marc Römer
    * @description load Input form, then overlay with jquery ui dialog widget
    * @param String url Url of the input-form
    */
   show : function (options) {

      var instance = this;

      this.options = options;

      this.loadHtml(options.url);

      dimension = this.getDialogDimension(instance.dialog.html());

      this.dialog.dialog({
         modal : true,
         minHeight: dimension.height,
         minWidth: dimension.width,
         create: function () {
            main.getUI().disable();
         },
         open: function () {
            if (typeof instance.options.submitHandler === "function"){
               instance.options.submitHandler.call(instance);
            } else {
               instance._submitHandler.call(instance);
            }
            instance.setVisibility(true);
         },
         close: function () {
            main.getUI().enable();
            instance.dialog.empty();
            instance.setVisibility(false);
         }
      });
   },
   /**
    * @description load upload form and show it with ui-dialog
    * @param String url Url of the upload-form
    * @param Function onCompleteHandler Handler which is called after dialog has opened
    */
   getUpload : function (url, onCompleteHandler) {

      var instance = this;

      this.loadHtml(url);

      dimension = this.getDialogDimension(instance.dialog.html());

      this.dialog.dialog({
         modal : true,
         minWidth : dimension.width,
         minHeight : dimension.height,
         create: function () {
            main.getUI().disable();
         },
         open: function () {
            if (onCompleteHandler !== null) {
               onCompleteHandler();
            }
            instance.setVisibility(true);
         },
         close: function () {
            main.getUI().enable();
            instance.dialog.empty();
            instance.setVisibility(false);
         }
      });
      return false;
   },
   /**
    * @author Marc-Leon Römer
    * @description Show confirm dialog with ui-dialog. If confirmed pass url & data to ClientServer.deleteObject to post the delete.
    */
   showDeleteDialog : function (url, data) {
      
     var instance = this;

      
      this.$deleteDialog
         .find(".data-title")
         .empty()
         .append(data.title);
      dimension = this.getDialogDimension(this.$deleteDialog.html());

      this.$deleteDialog.dialog({
         modal : true,
         //TODO where is 1.4 and 2.3 coming from?
         minWidth : dimension.width * 1.4,
         minHeight : dimension.height * 2.3,
         create: function () {
            main.getUI().disable();
         },
         open: function () {
            instance.setVisibility(true);
         },
         close: function () {
            main.getUI().enable();
            instance.setVisibility(false);
         },
         buttons : [
            {
               text : $("span#mp-confirm").text(),
               click : function () {
                  main.getClientServer().deleteObject(url, data);
                  $(this).dialog("close");
                  return true;
               }
            },
            {
               text : $("span#mp-abort").text(),
               click : function (event) {
                  
                  $(this).dialog("close");
                  return false;
               }
            }
         ]
      });
      
      return false;
   },
   /**
    @public
    @summary This is needed for testing the deletion of objects, because the confirm buttons cannot be queried in a reasonable fashion
    */
   confirmDelete : function () {
      if (! this.$deleteDialog.dialog("isOpen")){
         throw new Error("the dialog is not even open!");
      }
      var instance = this;
      this.$deleteDialog.dialog("option", "buttons").forEach(function (button) {
         //TODO the button text might change. There needs to be a better way to do that.
         if (button.text === "Yes"){
            //TODO it gets even uglier. now we need to call the click method and make sure 'this' is the dialog
            button.click.apply(instance.$deleteDialog.get(0));
         }
      });
   },
   loadHtml : function (url) {
      var instance = this;
      $.ajax({
         type: 'get',
         'url': url,
         async: false,
         success: function (res) {
            instance.dialog.html(res);
         },
         error: function (error) {
            alert(error);
         }
      });
      return html;
   },
   getDialogDimension : function (html) {
      $formWrapper = $("<div/>").css("display", "inline-block").html(html);
      $(".mp-content").append($formWrapper);
      //margin cuts of some space -> make it slightly bigger
      dimension = {"width": $formWrapper.width() * 1.2, "height": $formWrapper.height()};
      $formWrapper.remove();
      return dimension;
   },

   /**
    * @private
    */
   _submitHandler : function () {
      var instance = this, form, api;
      //grep 'this'
      instance = main.getUI().getInput();
      //register form validator and grep api
      form = $("form.mp-dialog");
      console.log(form);
      api = form.validator().data("validator");


      //called when data is valid
      api.onSuccess(function (e, els) {
//      form.submit(function(){
         //call all onForm callbacks
         if (typeof instance.options.submit === "function"){
            instance.options.submit.call(instance);
         }
         //submit form with ajax call and close popup
         $.ajax({
            type : form.attr("method"),
            url  : form.attr("action"),
            data : form.serialize(),
            dataType : "json",
            success : function (data, textStatus) {
               if (data.error) {
                  alert(data.error.toString());
                  return;
               }
               if (typeof instance.options.success === "function"){
                  instance.options.success.call(instance, data);
               }
               instance.close();
            },
            error : function (error) {
               instance.close();
               alert(error.toString());
            }
         });
         //prevent html form submit
         return false;
      });
      //_intercept gets called onLoad
      if (typeof this.options.load === "function") {
         this.options.load.call(instance);
      }
   },
   setVisibility : function (bool) {
      this.visible = bool;
   },
   isVisible : function () {
      return this.visible;
   },
   close : function () {
      this.dialog.dialog("close");
   },
   closeConfirm : function () {
      $("#confirm-delete").dialog("close");
   }
};
