/*jslint */
/*global $, main, define, mpEvents, gettext, CONFIRM_DIALOG, INPUT_DIALOG, ALERT_DIALOG, assertTrue */

"use strict";

/**
 * @author Frederik Claus
 * @class Handles any form of input. Takes care of form validation, error handling and closing the input dialog
 */


define([
   "dojo/_base/declare",
   "./View",
   "./DialogMessageView",
   "../view/PhotoEditorView",
   "../util/PhotoFileValidator",
   "../util/Communicator",
   "dojo/domReady!"
],
       function (declare, View, DialogMessageView, PhotoEditorView, PhotoFileValidator, communicator) {
      $.extend($.ui.dialog.prototype.options, {
         autoOpen: false,
         modal: true,
         zIndex: 3000,
         draggable: false,
         closeOnEscape : false
      });

      return declare(View, {
         constructor : function () {
            
            this.$container = $("#mp-dialog");
            assertTrue(this.$container.size() === 1);
            this.viewName = "Dialog";
            
            this.$dialog = $("#mp-dialog");
            this.width = this.$dialog.width();
            this.height = this.$dialog.height();
            //#mp-dialog receives styling to set up the height and width
            //ui.dialog does not play well with that
            this.$dialog.removeAttr("id");
            this.visible = false;
            // indicates if the user submitted the form
            this.abort = true;
            // this.editor = new PhotoEditorView();
            this.photoValidator = new PhotoFileValidator();
            
            //temporary properties, when dialog is loaded and opened
            this.message = null;
            this.$form = null;
            this.$buttons = null;
            this.$close = null;
            
            this._bindActivationListener(this.$container, this.viewName);
            this._bindListener();
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
      
            this.$dialog.dialog("option", {
               close: function () {
                  instance.$dialog.empty();
                  instance.$dialog.dialog("destroy");
                  instance.setVisibility(false);
                  instance.setActive(false);
                  console.log("DialogView: closed");
                  // in case the user did not submit or a network/server error occurred and the dialog is closed
                  if (instance.abort) {
                     instance._trigger(instance.options, "abort");
                  }
               },
               open: function () {
                  instance.$loader = $("<img src='/static/images/light-loader.gif'/>").appendTo("div.ui-dialog-buttonpane").hide();
                  instance._submitHandler.call(instance);
                  instance.setVisibility(true);
                  // focus for activation
                  instance.$container.focus();
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
                        }
                     }
                  ]
               });
               break;

            case ALERT_DIALOG : 
               this.$dialog.dialog("option", {
                  buttons : [
                     {
                        id : "mp-dialog-button-ok",
                        text : gettext("OK"),
                        click : function () {
                           $(this).dialog("close");
                           return false;
                        }
                     }
                  ]
               });
               break;
            }
            //if we open the dialog earlier the open callback from above will never be called
            this.$dialog.dialog("open");
                  
         },
         setVisibility : function (bool) {
            this.visible = bool;
         },
         // TODO dialog("close") seems to trigger another dialog("open") which will set the visiblity to true again. See the DialogViewTest autoClose. Wtf?!
         isVisible : function () {
            return this.visible;
         },
         close : function () {
            this.$dialog.dialog("close");
            this.message = null;
            this.$buttons = null;
            this.$close = null;
            this.$form = null;
         },
         showResponseMessage : function (response) {
            var height = this.$container.children().eq(0).height();
            if (!response.success) {
               this.$loader.hide();
               this.message.showFailure(response.error);
               this._scrollToMessage(height);
               this.$close.button("enable");
               return;
            }
            // set only when the request did not produce an error
            this.abort = false;
            this._trigger(this.options, "success", response);

            if (this.message.isAutoClose()) {
               this.close();
            } else {
               this.$loader.hide();
               this.message.showSuccess();
               this._scrollToMessage(height);
               this.$close.button("enable");
            }
         },
         showNetworkError : function () {
            this.$loader.hide();
            this._scrollToMessage(this.message);
            this.message.showFailure(gettext("NETWORK_ERROR"));
            this.$close.button("enable");
         },
         setInputValue : function (name, value) {
            assertTrue(this.$form, "Form has to be loaded before settings its input values");
            var $input = this.$form.find("[name='" + name +  "']");
            assertTrue($input.size() === 1, "The selected input field does not exist.");
            $input.val(value);
         },
         //TODO This feature has been put on hold temporarily.
         startPhotoEditor : function () {
            assertTrue(this.$form, "Form has to be loaded before settings its input values");
            assertTrue(this.options.isPhotoUpload, "Editor is not available unless it is a photo upload");
            var instance = this;
            this.$form.find("input[name='" + this.options.photoInputName + "']").bind('change', function (event) {
               instance.photoValidator.validate($(this), event);
               // input.editor.edit.call(input.editor, event);
            });
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
               "title": title,
               //TODO height is a messy business. height includes the title bar (wtf?!)
               //the dialog content is styled in percent of the parent. 
               //this makes it impossible to calculate dimension of a dialog, because they depend on the dimension of the parent.
               //limit maximum height
               "maxHeight" : this.height,
               //set the width to allow percentage styling
               "width": this.options.width || this.width
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
                  html = gettext("NETWORK_ERROR");
                  //we need to change the type of the dialog to INPUT_DIALOG to prevent the buttons from showing
                  instance.options.type = ALERT_DIALOG;
               }
            });
            return html;
         },
         /**
          * @private
          */
         _submitHandler : function () {
            var instance = this,
                $widget = this.$dialog.dialog("widget");
            
            // set temporary properties
            this.$form = $widget.find("form");
            this.message = new DialogMessageView($widget);
            this.$close = $widget.find("ui-dialog-titlebar-close");
            // No need to add the ok button, because it just closes the dialog.
            this.$buttons = this.$form
                              .find("button, input[type='submit']")
                              .add($("#mp-dialog-button-yes"))
                              .add($("#mp-dialog-button-no"))
                              .add($("#mp-dialog-button-save"))
                              .add(this.$close);
            //called when data is valid
            this.$form.validate({
               success : "valid",
               errorPlacement : function () {}, //don't show any errors
               submitHandler : function () {
                  instance.$buttons.button("disable");
                  instance.$loader.show();
                  
                  var data = instance._getFormData(instance.$form);
                  if (instance.options.isPhotoUpload) {
                     data.isPhotoUpload = true;
                  }
                  
                  instance._trigger(instance.options, "submit", data);
               }
            });
            this._trigger(this.options, "load");
         },
         _getFormData : function ($form) {
            var formData = {},
               $relevantInput = $form.find("input, textarea");
               
            
            if (this.options.isPhotoUpload) {
               $relevantInput = $relevantInput.not("input[name='" + this.options.photoInputName + "']");
               formData[this.options.photoInputName] = this.photoValidator.getFile();
            }
            
            $.each($relevantInput, function (index, input) {
               formData[$(input).attr("name")] = $(input).val();
            });
            
            return formData;
         },
         _scrollToMessage : function (message) {
            var scrollTop = 0;
            this.$dialog.stop().animate({
               scrollTop : message
            }, 300);
         },
         _trigger : function (options, name, args) {
            if (typeof options[name] === "function") {
               options[name].call(options.context, args);
            }
         },
         _submitForm : function () {
            this.$dialog.dialog("widget").find("form").trigger("submit");
         },
         _bindListener : function () {
            var instance = this;
            $("body").on("keyup.Dialog", null, "esc", function () {
               if (!instance.disabled && instance.active) {
                  instance.close();
               }
            });
         }
      });
   });
