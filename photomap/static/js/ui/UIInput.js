/*jslint */
/*global $, main, mpEvents, gettext */

"use strict";

/**
 * @author Frederik Claus
 * @class Handles any form of input. Takes care of form validation,error handling and closing the input dialog
 */

var UIInput, UIInputMessage, dimension, $formWrapper, html;

$.extend($.ui.dialog.prototype.options, {
   autoOpen: false,
   modal: true,
   zIndex: 3000,
   draggable: false,
   closeOnEscape : false
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
      this.options = $.extend({}, {type : UIInput.INPUT_DIALOG, context : this}, options);
      //load html, add the title and the resize the box
      this._prepareDialog(this.options.url);

      this.$dialog.dialog("option",{
         close: function () {
            main.getUI().enable();
            instance.$dialog.empty();
            instance.$dialog.dialog("destroy");
            instance.setVisibility(false);
         },
         open: function () {
            instance._submitHandler.call(instance);
            instance.setVisibility(true);
         }

      });

      switch (this.options.type) {

      case UIInput.CONFIRM_DIALOG:
         this.$dialog.dialog("option", {
            buttons : [
               {
                  id: "mp-dialog-button-yes",
                  text : gettext("YES"),
                  click : function () {
                     instance._submitForm();
                     return true;
                  }
               },
               {
                  id : "mp-dialog-button-no",
                  text : gettext("NO"),
                  click : function (event) {
                     $(this).dialog("close");
                     return false;
                  }
               }
            ]
         });
         break;

      case UIInput.INPUT_DIALOG : 
         this.$dialog.dialog("option", {
            buttons : [
               {
                  id : "mp-dialog-button-save",
                  text : gettext("SAVE"),
                  click : function () {
                     instance._submitForm();
                  },
               },

            ]
         });
         break;
      }
      //if we open the dialog earlier the open callback from above will never be called
      this.$dialog.dialog("open");
            
   },
   _prepareDialog : function (url){
      html = this._loadHtml(url);
      var $wrapper = this._wrapHtml(html),
          title = this._removeTitle($wrapper);

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
         //TODO height is a messy business. height includes the title bar (wtf?!)
         //the dialog content is styled in percent of the parent. 
         //this makes it impossible to calculate dimension of a dialog, because they depend on the dimension of the parent.
         //limit maximum height
         "maxHeight" : this.height,
         //set the width to allow percentage styling
         "width": this.width,
         // "heightStyle": "content"
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
            //TODO we need to change the type of the dialog to INPUT_DIALOG to prevent the buttons from showing
            html = gettext("NETWORK_ERROR");
         }
      });
      return html;
   },
   /**
    * @private
    */
   _submitHandler : function () {
      var instance = this,
          $widget = this.$dialog.dialog("widget"),
          $form = $widget.find("form.mp-dialog-content"),
          $close = $widget.find("ui-dialog-titlebar-close"),
          $buttons = $form
             .find("button, input[type='submit']")
             .add($("#mp-dialog-button-yes"))
             .add($("#mp-dialog-button-no"))
             .add($("#mp-dialog-button-save"))
             .add($close),
          message = new UIInputMessage($("#mp-dialog-message"));
      

      //called when data is valid
      $form.validate({
         success : "valid",
         errorPlacement : function () {}, //don't show any errors
         submitHandler : function () {
            $buttons.button("disable");
            instance._trigger(instance.options, "submit");
            //submit form with ajax call and close popup
            $.ajaxSetup({
               type : $form.attr("method"),
               success : function (data, textStatus) {
                  if (data.error) {
                     message.showFailure(data.error);
                     $buttons.button("enable");
                     return;
                  }
                  instance._trigger(instance.options, "success", data);

                  if (message.isAutoClose()){
                     instance.close();
                  } else {
                     message.showSuccess();
                     $close.button("enable");
                  }
                  // so we don't forget :)
                  main.getClientState().updateUsedSpace();
               },
               error : function (error) {
                  // instance.close();
                  message.showFailure(gettext("NETWORK_ERROR"));
                  $buttons.button("enable");
               }
            });

            if (typeof instance.options.data === "function"){
               $.ajax({
                  processData : false,
                  contentType : false,
                  cache : false,
                  data : instance.options.data.call(instance.options.context),
                  url : $form.attr("action")
               });
            }
            else{
               $.ajax({               
                  url  : $form.attr("action"),
                  data : $form.serialize(),
                  dataType : "json"
               });
            }
         }
      });
      this._trigger(this.options, "load");
   },
   _trigger : function (options, name, args){
      if (typeof options[name] === "function"){
         options[name].call(options.context, args);
      }
   },
   _submitForm : function () {
      this.$dialog.dialog("widget").find("form.mp-dialog-content").trigger("submit");
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

UIInputMessage = function ($el) {
   this.$el = $el;
   this.$success = this.$el.find("#mp-dialog-message-success").hide();
   this.$failure = this.$el.find("#mp-dialog-message-failure").hide();
   this.$error = this.$failure.find("em");
   this.$autoClose = this.$el.find("input[name='auto-close']");
   this.autoClose = main.getUIState().getDialogAutoClose();
   this._bindListener();
};

UIInputMessage.prototype = {
   showSuccess : function () {
      this.$success.show("slow");
   },
   showFailure : function (error) {
      this.$failure.show("slow");
      this.$error.text(error.toString());
   },
   isAvailable : function () {
      return this.$el.length > 0;
   },
   isAutoClose : function () {
      return this.autoClose;
   },
   /**
    @private
    */
   _bindListener : function () {
      this.$autoClose.click(function () {
         var autoClose = false;
         if ($(this).is(":checked")){
            autoClose = true;
         }
         main.getUIState().setDialogAutoClose(autoClose);
         this.autoClose = autoClose;
      });
   },
};
      
      
