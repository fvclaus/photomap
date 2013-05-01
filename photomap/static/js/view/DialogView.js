/*jslint */
/*global $, main, mpEvents, gettext, CONFIRM_DIALOG, INPUT_DIALOG */

"use strict";

/**
 * @author Frederik Claus
 * @class Handles any form of input. Takes care of form validation, error handling and closing the input dialog
 */

$.extend($.ui.dialog.prototype.options, {
   autoOpen: false,
   modal: true,
   zIndex: 3000,
   draggable: false,
   closeOnEscape : false
});

define(["dojo/_base/declare", "view/View", "view/DialogMessageView", "util/ClientState", "view/PhotoEditorView", "dojo/domReady!"], 
   function (declare, View, DialogMessageView, clientstate, PhotoEditorView) {
      return declare(View, {
         constructor : function () {
            this.$dialog = $("#mp-dialog");
            this.width = this.$dialog.width();
            this.height = this.$dialog.height();
            //#mp-dialog receives styling to set up the height and width
            //ui.dialog does not play well with that
            this.$dialog.removeAttr("id");
            this.visible = false;
            // indicates if the user submitted the form
            this.abort = true;
            this.editor = new PhotoEditorView();
            
         },
         /**
          * @author Frederik Claus, Marc Römer
          * @description load Input form, then overlay with jquery ui dialog widget
          * @param String url Url of the input-form
          */
         show : function (options) {
      
            var instance = this;
            //default dialog type is INPUT_DIALOG
            this.options = $.extend({}, {type : INPUT_DIALOG, context : this}, options);
            //load html, add the title and the resize the box
            this._prepareDialog(this.options.url);
      
            this.$dialog.dialog("option",{
               close: function () {
                  main.getUI().enable();
                  instance.$dialog.empty();
                  instance.$dialog.dialog("destroy");
                  instance.setVisibility(false);
                  // in case the user did not submit or a network/server error occurred and the dialog is closed
                  if (instance.abort) {
                     instance._trigger(instance.options, "abort");
                  }
               },
               open: function () {
                  instance.$loader = $("<img src='/static/images/light-loader.gif'/>").appendTo("div.ui-dialog-buttonpane").hide();
                  instance._submitHandler.call(instance);
                  instance.setVisibility(true);
               }
      
            });
      
            switch (this.options.type) {
      
            case CONFIRM_DIALOG:
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
      
            case INPUT_DIALOG : 
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
            var html = this._loadHtml(url),
               $wrapper = this._wrapHtml(html),
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
               create: function (event, ui) {
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
            var instance = this,
               html;
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
                $form = $widget.find("form"),
                $close = $widget.find("ui-dialog-titlebar-close"),
                $buttons = $form
                   .find("button, input[type='submit']")
                   .add($("#mp-dialog-button-yes"))
                   .add($("#mp-dialog-button-no"))
                   .add($("#mp-dialog-button-save"))
                   .add($close),
                message = new DialogMessageView($widget);
            
      
            //called when data is valid
            $form.validate({
               success : "valid",
               errorPlacement : function () {}, //don't show any errors
               submitHandler : function () {
                  $buttons.button("disable");
                  instance.$loader.show();
                  instance._trigger(instance.options, "submit");
                  //submit form with ajax call and close popup
                  $.ajaxSetup({
                     type : $form.attr("method"),
                     success : function (data, textStatus) {
      
                        if (!data.success) {
                           instance.$loader.hide();
                           instance._scrollToMessage(message);
                           message.showFailure(data.error);
                           $buttons.button("enable");
                           return;
                        }
                        // set only when the request did not produce an error
                        instance.abort = false;
                        instance._trigger(instance.options, "success", data);
      
                        if (message.isAutoClose()){
                           instance.close();
                        } else {
                           instance.$loader.hide();
                           instance._scrollToMessage(message);
                           message.showSuccess();
                           $close.button("enable");
                        }
                        // so we don't forget :)
                        clientstate.updateUsedSpace();
                     },
                     error : function (error) {
                        // instance.close();
                        instance.$loader.hide();
                        instance._scrollToMessage(message);
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
         _scrollToMessage : function (message) {
            this.$dialog.stop().animate({
               scrollTop : message.getOffset().top
            }, 300);
         },
         _trigger : function (options, name, args){
            if (typeof options[name] === "function"){
               options[name].call(options.context, args);
            }
         },
         _submitForm : function () {
            this.$dialog.dialog("widget").find("form").trigger("submit");
         },
         setVisibility : function (bool) {
            this.visible = bool;
         },
         isVisible : function () {
            return this.visible;
         },
         close : function () {
            this.$dialog.dialog("close");
         }
      });
   });
