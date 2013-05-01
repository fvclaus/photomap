/*jslint */
/*global $, main, gettext */

"use strict";

/**
 * @author Frederik Claus
 * @class Shows the feedback (success or failure) in DialogView
 */

define(["dojo/_base/declare", "view/View", "ui/UIState", "dojo/domReady!"], 
   function (declare, View, state) {
      return declare(View, {
         constructor : function ($el) {
            this.$el = $el;
            this.$container = this.$el.find("#mp-dialog-message");
            this.$success = this.$el.find("#mp-dialog-message-success").hide();
            this.$failure = this.$el.find("#mp-dialog-message-failure").hide();
            this.$error = this.$failure.find("em");
            this.$autoClose = this.$el.find("input[name='auto-close']");
            this.autoClose = state.getDialogAutoClose();
            this._bindListener();
         },
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
          * @private
          */
         _bindListener : function () {
            this.$autoClose.click(function () {
               var autoClose = false;
               if ($(this).is(":checked")){
                  autoClose = true;
               }
               state.setDialogAutoClose(autoClose);
               this.autoClose = autoClose;
            });
         },
         getOffset : function () {
            return this.$container.offset();
         }
      });
   });
   