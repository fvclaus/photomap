/*jslint */
/*global $, main, mpEvents */

"use strict";

/**
 * @author Frederik Claus
 * @class Handles any form of input. Takes care of form validation,error handling and closing the input dialog
 */

var UIInput, dimension, $formWrapper, html;

$.extend($.ui.dialog.prototype.options, {
   autoOpen: false,
   modal: true,
   zIndex: 3000,
   draggable: false,
});

UIInput = function () {
   this.$dialog = $("#input-dialog");
   this.visible = false;
   // this.$deleteDialog = $("#confirm-delete");
};

UIInput.INPUT_DIALOG = 0;
UIInput.CONFIRM_DIALOG = 1;


UIInput.prototype = {
   /**
    * @author Marc Römer
    * @description load Input form, then overlay with jquery ui dialog widget
    * @param String url Url of the input-form
    */
   show : function (options) {

      var instance = this;
      //default dialog type is INPUT_DIALOG
      this.options = $.extend({}, {type: UIInput.INPUT_DIALOG}, options);
      //load html, add the title and the resize the box
      this._prepareDialog(this.options.url);

      this.$dialog.dialog("option",{
         close: function () {
            main.getUI().enable();
            instance.$dialog.empty();
            instance.$dialog.dialog("destroy");
            instance.setVisibility(false);
         }

      });

      switch (this.options.type) {

      case UIInput.INPUT_DIALOG :  
         this.$dialog.dialog("option", {
            open: function () {
               if (typeof instance.options.submitHandler === "function"){
                  instance.options.submitHandler.call(instance);
               } else {
                  instance._submitHandler.call(instance);
               }
               instance.setVisibility(true);
            }
         });
         break;

      case UIInput.CONFIRM_DIALOG:
         this.$dialog.dialog("option", {
            open: function () {
               instance.setVisibility(true);
            },
            buttons : [
               {
                  text : $("span#mp-confirm").text(),
                  click : function () {
                     main.getClientServer().deleteObject(this.options.url, this.options.data);
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
         break;

      default: throw new Error("Unknown dialog type "+ this.options.type);
      }
      //if we open the dialog earlier the open callback from above will never be called
      this.$dialog.dialog("open");
            
   },
   _prepareDialog : function (url){
      html = this._loadHtml(url);
      var $wrapper = this._wrapHtml(html),
          dimension = this._getDialogDimension($wrapper),
          title = this._removeTitle($wrapper);

      //add the html without the title
      this.$dialog.html($wrapper.html());
      $wrapper.remove();
      //resize the dialog to fit the content without scrolling
      //we must add a new dialog here
      this.$dialog.dialog({
         //this can only be called here, because we must create the dialog here
         create: function () {
            main.getUI().disable();
         },
         "title" : title,
         "minWidth": dimension.width,
         "minHeigth": dimension.height
      });


   },

   _wrapHtml : function (html) {
      var $wrapper = $("<div/>").css("display", "inline-block").html(html);
      $(".mp-content").append($wrapper);
      return $wrapper;
   },
   _removeTitle : function ($el) {
      var $title = $el.find("h2"),
          title = $title.text();
      $title.remove();
      return title;
   },

   /**
    @public
    @summary This is needed for testing the deletion of objects, because the confirm buttons cannot be queried in a reasonable fashion
    */
   confirmDelete : function () {
      if (! this.$dialog.dialog("isOpen")){
         throw new Error("the dialog is not even open!");
      }
      var instance = this;
      this.$dialog.dialog("option", "buttons").forEach(function (button) {
         //TODO the button text might change. There needs to be a better way to do that.
         if (button.text === "Yes"){
            //TODO it gets even uglier. now we need to call the click method and make sure 'this' is the dialog
            button.click.apply(instance.$dialog.get(0));
         }
      });
   },
   /**
    @private
    @returns html from the url
    */
   _loadHtml : function (url) {
      var instance = this;
      $.ajax({
         type: 'get',
         'url': url,
         async: false,
         success: function (res) {
            html = res;
         },
         error: function (error) {
            alert(error);
         }
      });
      return html;
   },
   /**
    @private
    @param html markup to show in the dialog
    @returns {Object} width and height of the dialog containing the html
    */
   _getDialogDimension : function ($wrapper) {
      //margin cuts of some space -> make it slightly bigger
      dimension = {"width": $wrapper.width() * 1.2, "height": $wrapper.height()};
      return dimension;
   },

   /**
    * @private
    */
   _submitHandler : function () {
      var instance = this,
          $form = $("form.jquery-validator");

      //called when data is valid
      $form.validate({
         success : "valid",
         errorPlacement : function () {}, //don't show any errors
         submitHandler : function () {
            if (typeof instance.options.submit === "function"){
               instance.options.submit.call(instance);
            }
            //submit form with ajax call and close popup
            $.ajax({
               type : $form.attr("method"),
               url  : $form.attr("action"),
               data : $form.serialize(),
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
         }
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
