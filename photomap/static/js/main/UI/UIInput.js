//wraps fancybox for displaying forms in overlay
UIInput = function(){
    this._initialise();
};
UIInput.prototype = {
    get : function(url){
	// close mask if open
	$.mask.close();
	
	var instance = this;
	var margin = main.getUI().getPanel().getHeaderOffset().top;
	$.fancybox({
	    href : url,
	    onComplete : instance._intercept,
	    onClosed : instance._initialise,
	    margin: 30,
	    overlayColor: '#FFF',
	    speedOut: 0,
	});
	return this;
    },
    getUpload : function(url,onCompleteHandler){
	// close mask if open
	$.mask.close();
	
	var instance = this;
	$.fancybox({
	    href : url,
	    onComplete : onCompleteHandler,
	    onClosed : function(){
		mpEvents.trigger("body",mpEvents.iframeClose);
		mpEvents.trigger("body",mpEvents.toggleExpose);
	    },
	    margin: 50,
	    overlayColor: '#FFF',
	    speedOut: 0,
	});
	return this;
    },
    //content has been loaded
    onLoad : function(callback){
	this._onLoads.push(callback);
	return this;
    },
    //form has been submitted
    onForm : function(callback){
	this._onForms.push(callback);
	return this;
    },
    //response has been received
    onAjax : function(callback){
	this._onAjaxs.push(callback);
	return this;
    },
    _intercept : function(){
	//grep 'this' 
	var instance = main.getUI().getInput();
	//register form validator and grep api
	var form = $("form.mp-dialog")
	var api = form.validator().data("validator");
	api.onSuccess(function(e,els){
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
		    instance._close();
		},
		error : function(error){
		    instance._close();
		    alert(error.toString());
		}
	    });
	    return false;
	});
	$.tools.validator.addEffect("alert",function(errors,events){
	    alert("please recheck the form");
	});
	instance._onLoad();
    },
    _initialise : function(){
	this._onLoads = new Array();
	this._onForms = new Array();
	this._onAjaxs = new Array();
    },
    //content has been loaded
    _onLoad : function(){
	this._onLoads.forEach(function(load){
	    load.call();
	});
	this._onLoads = new Array();
    },
    _onForm : function(){
	this._onForms.forEach(function(form){
	    form.call();
	});
	this._onForms = new Array();
    },
    _onAjax : function(data){
	this._onAjaxs.forEach(function(ajax){
	    ajax.call(this,data);
	});
	this._onAjaxs = new Array();
    },
    _close : function() {
	$.fancybox.close();
    }
};
