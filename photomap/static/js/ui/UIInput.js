/*
 * @author Frederik Claus
 * @class Handles any form of input. Takes care of form validation,error handling and closing the input dialog
 */
UIInput = function(){
   this._initialise();
   this.dialog = $("#input-dialog");
};
UIInput.prototype = {
   get : function(url){

      var instance = this;
      
      $.ajax({
         type: 'get',
         'url': url,
         async: false,
         success: function(res){
            instance.dialog.html(res);
         },
         error: function(error){
            alert(error);
         }
      });
      
      this.dialog.dialog({
         autoOpen: true,
         modal: true,
         zIndex: 3000,
         draggable: false,
         create: function(){
            main.getUI().disable();
         },
         open: function(){
            instance._intercept();
         },
         close: function(){
            instance._initialise();
            main.getUI().enable();
            instance.dialog.empty();
         }
      });
   },
   getUpload : function(url,onCompleteHandler){
   
      var instance = this;
      
      $.ajax({
         type: 'get',
         'url': url,
         async: false,
         success: function(res){
            instance.dialog.html(res);
         },
         error: function(error){
            alert(error);
         }
      });
      
      this.dialog.dialog({
         autoOpen: true,
         modal: true,
         zIndex: 3000,
         draggable: false,
         create: function(){
            main.getUI().disable();
         },
         open: onCompleteHandler,
         close: function(){
            main.getUI().enable();
            mpEvents.trigger("body",mpEvents.toggleExpose);
            instance.dialog.empty();
         }
      });
      return false;
   },
   /*
    * @description Fires the onLoad event, when the input dialog is loaded. Subscribe here if you want to receive the onLoad event with  your callback.
    * param {Function} callback
    */
   onLoad : function(callback){
      this._onLoads.push(callback);
      return this;
   },
   /*
    * @description Fires the onForm event, when the form is valid, but before submit. Subscribe here if you want to receive the onForm event with your callback.
    * @param {Function} callback
    */
   onForm : function(callback){
      this._onForms.push(callback);
      return this;
   },
   /*
    * @description Fires the ajaxReceived event, when a valid response is returned. Subscribe here if you want to receive the ajaxReceived event with your callback.
    * @param {Function} callback
    */
   onAjax : function(callback){
      this._onAjaxs.push(callback);
      return this;
   },
   /*
    * @private
    */
   _intercept : function(){
      //grep 'this'
      var instance = main.getUI().getInput();
      //register form validator and grep api
      var form = $("form.mp-dialog");
      console.log(form);
      var api = form.validator().data("validator");
      console.log(form.serialize());
      console.log(api);
      //called when data is valid
      api.onSuccess(function(e,els){
//      form.submit(function(){
         //call all onForm callbacks
         instance._onForm();
         //submit form with ajax call and close popup
         $.ajax({
            type : form.attr("method"),
            url  : form.attr("action"),
            data : form.serialize(),
            dataType : "json",
            success : function(data,textStatus){
               if (data.error){
                  alert(data.error.toString());
                  return;
               }
               instance._onAjax(data);
               instance.close();
            },
            error : function(error){
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
   /*
    * @private
    */
   _initialise : function(){
      this._onLoads = new Array();
      this._onForms = new Array();
      this._onAjaxs = new Array();
   },
   /*
   * @private
   */
   _onLoad : function(){
      this._onLoads.forEach(function(load){
         load.call();
      });
      this._onLoads = new Array();
   },
   /*
    * @private
    */
   _onForm : function(){
      this._onForms.forEach(function(form){
         form.call();
      });
      this._onForms = new Array();
   },
   /*
    * @private
    */
   _onAjax : function(data){
      this._onAjaxs.forEach(function(ajax){
         ajax.call(this,data);
      });
      this._onAjaxs = new Array();
   },
   /*
    * @private
    */
   close : function() {
      this.dialog.dialog("close");
   }
};
