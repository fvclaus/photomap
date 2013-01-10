/*jslint */
/*global $, main, mpEvents */

"use strict";

/**
 * @author Frederik Claus
 * @class Handles any form of input. Takes care of form validation,error handling and closing the input dialog
 */

var UIInput;

UIInput = function () {
   this._initialise();
   this.dialog = $("#input-dialog");
   this.visible = false;
};
UIInput.prototype = {
   /**
    * @author Marc Römer
    * @description load Input form, then overlay with jquery ui dialog widget
    * @param String url Url of the input-form
    */
   get : function (url) {

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

      this.dialog.dialog({
         autoOpen: true,
         modal: true,
         zIndex: 3000,
         draggable: false,
         create: function () {
            main.getUI().disable();
         },
         open: function () {
            instance._intercept();
            instance.setVisibility(true);
         },
         close: function () {
            instance._initialise();
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

      this.dialog.dialog({
         autoOpen: true,
         modal: true,
         zIndex: 3000,
         draggable: false,
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
    * @description Fires the onLoad event, when the input dialog is loaded. Subscribe here if you want to receive the onLoad event with  your callback.
    * param {Function} callback
    */
   onLoad : function (callback) {
      this._onLoads.push(callback);
      return this;
   },
   /**
    * @description Fires the onForm event, when the form is valid, but before submit. Subscribe here if you want to receive the onForm event with your callback.
    * @param {Function} callback
    */
   onForm : function (callback) {
      this._onForms.push(callback);
      return this;
   },
   /**
    * @description Fires the ajaxReceived event, when a valid response is returned. Subscribe here if you want to receive the ajaxReceived event with your callback.
    * @param {Function} callback
    */
   onAjax : function (callback) {
      this._onAjaxs.push(callback);
      return this;
   },
   /**
    * @private
    */
   _intercept : function () {
      var instance, form, api;
      //grep 'this'
      instance = main.getUI().getInput();
      //register form validator and grep api
      form = $("form.mp-dialog");
      console.log(form);
      api = form.validator().data("validator");
      console.log(form.serialize());
      console.log(api);
      //called when data is valid
      api.onSuccess(function (e, els) {
//      form.submit(function(){
         //call all onForm callbacks
         instance._onForm();
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
               instance._onAjax(data);
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
      instance._onLoad();
   },
   /**
    * @private
    */
   _initialise : function () {
      this._onLoads = [];
      this._onForms = [];
      this._onAjaxs = [];
   },
   /**
    * @private
    */
   _onLoad : function () {
      this._onLoads.forEach(function (load) {
         load.call();
      });
      this._onLoads = [];
   },
   /**
    * @private
    */
   _onForm : function () {
      this._onForms.forEach(function (form) {
         form.call();
      });
      this._onForms = [];
   },
   /**
    * @private
    */
   _onAjax : function (data) {
      this._onAjaxs.forEach(function (ajax) {
         ajax.call(this, data);
      });
      this._onAjaxs = [];
   },
   setVisibility : function (bool) {
      this.visible = bool;
   },
   isVisible : function () {
      return this.visible;
   },
   close : function () {
      this.dialog.dialog("close");
   }
};
