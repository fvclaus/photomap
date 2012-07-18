UI = function (){
	this.tools = new UITools();
	this.information = new UIInformation();
	this.panel = new UIPanel();
	this.controls = new UIControls(this.panel.getControlsBarHeight());
	this.gallery = new UIGallery();
	this.input = new UIInput();
	this.textbox = new UITextbox();
}

UI.prototype = {

	init : function(){
		this.gallery.init();
		this.textbox.init();
		this.panel.init();
	},
	getAlbum : function(){
		return this.gallery.getAlbum();
	},
	getGallery : function(){
		return this.gallery;
	},
	getSlideshow : function(){
		return this.gallery.getSlideshow();
	},
	getTools : function(){
		return this.tools;
	},
	getControls : function(){
		return this.controls;
	},
	getInformation : function(){
		return this.information;
	},
	getState : function(){
		return this.gallery.getState();
	},
	getInput : function(){
		return this.input;
	},
};
