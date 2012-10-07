/*
 * @author Frederik Claus
 * @class UI is a facade for all other UI classes
 */
UI = function (){
	this.tools = new UITools();
	this.information = new UIInformation();
	this.panel = new UIPanel();
	this.controls = new UIControls();
	this.album = new UIAlbum();
	this.input = new UIInput();
	this.cursor = new UICursor();
}

UI.prototype = {

	init : function(){
		this.album.init();
		this.information.init();
		this.panel.init();
		this.controls.init();
		this.cursor.init();
	},
	getCursor : function(){
		return this.cursor;
	},
	getGallery : function(){
		return this.album.getGallery();
	},
	getAlbum : function(){
		return this.album;
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
		return this.album.getState();
	},
	getInput : function(){
		return this.input;
	},
	getPanel : function(){
		return this.panel;
	},
	/*
	 * @description This should provide one method to disable the whole GUI
	 */
	disable : function(){
		this.album.disable();
	},
};
