UI = function (){
	this.tools = new UITools();
	this.information = new UIInformation();
	this.controls = new UIControls(this.information.getControlsBarHeight());
	this.title = new UITitle();
	this.gallery = new UIGallery();
	this.input = new UIInput();
}

UI.prototype = {

	init : function(){
		this.title.init();
		this.gallery.init();
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
