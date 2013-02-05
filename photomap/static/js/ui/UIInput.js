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
   this.$dialog = $("#mp-dialog");
   this.width = this.$dialog.width();
   this.height = this.$dialog.height();
   //#mp-dialog receives styling to set up the height and width
   //ui.dialog does not play well with that
   this.$dialog.removeAttr("id");
   this.visible = false;
};

UIInput.INPUT_DIALOG = 0;
UIInput.CONFIRM_DIALOG = 1;


UIInput.prototype = {
   /**
    * @author Frederik Claus, Marc Römer
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
                  id: "mp-dialog-button-ok",
                  text : $("span#mp-confirm").text(),
                  click : function () {
                     //disable button before submit
                     $("#mp-dialog-button-ok, #mp-dialog-button-cancel").button("disable");
                     main.getClientServer().deleteObject(this.options.url, this.options.data);
                     $(this).dialog("close");
                     return true;
                  }
               },
               {
                  id : "mp-dialog-button-cancel",
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
          title = this._removeTitle($wrapper);
          // dimension = this._getDialogDimension($wrapper);

      //add the html without the title
      this.$dialog.html($wrapper.html());
      $wrapper.remove();
      //turn buttons into jquery ui buttons if present
      this.$dialog.find("button, input[type='submit']").button();
      //resize the dialog to fit the content without scrolling
      //we must add a new dialog here
      this.$dialog.dialog({
         //this can only be called here, because we must create the dialog here
         create: function () {
            main.getUI().disable();
         },
         "title": title,
         "width": this.width,
         "height" : this.height,
         // "heightStyle": "content"
      });
         //TODO height is a messy business. height includes the title bar (wtf?!)
         //the dialog content is styled in percent of the parent. 
         //this makes it impossible to calculate dimension of a dialog, because they depend on the dimension of the parent.
         //limit maximum height
         // "maxHeight" : this.height,
         // "maxHeight" : 500,
         //set the width to allow percentage styling
         // "width" : this.width,


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
   // _getDialogDimension : function ($wrapper) {
   //    if ($wrapper.find(".mp-tabs").length > 0){
   //       //TODO tabs causes messy problems when the height varies between the tabs
   //       //HOTFIX heightStyle auto adapts to the height of the tallest tab
   //       $wrapper.find(".mp-tabs").tabs({
   //          "heightStyle" : "auto"
   //       });
   //    }
   //    //margin cuts of some space -> make it slightly bigger
   //    dimension = {"width": $wrapper.width() * 1.2, "height": $wrapper.height()};
   //    return dimension;
   // },

   /**
    * @private
    */
   _submitHandler : function () {
      var instance = this,
          $form = $("form.jquery-validator"),
          $buttons = $form.find("button, input[type='submit']");

      //called when data is valid
      $form.validate({
         success : "valid",
         errorPlacement : function () {}, //don't show any errors
         submitHandler : function () {
            $buttons.button("disable");
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
                     $buttons.button("enable");
                     return;
                  }
                  if (typeof instance.options.success === "function"){
                     instance.options.success.call(instance, data);
                  }
                  instance.close();
               },
               error : function (error) {
                  // instance.close();
                  alert(error.toString());
                  $buttons.button("enable");
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
      this.$dialog.dialog("close");
   },
};
