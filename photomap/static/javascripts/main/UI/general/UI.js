UI = function (){
	this.tools = new UITools();
	this.panel = new UIPanel();
	this.controls = new UIControls(this.panel.getControlsBarHeight());
	this.input = new UIInput();
	this.contentbox = new UIContentbox();
}

UI.prototype = {

	init : function(){
		this.contentbox.init();
		this.panel.init();
	},
	getTools : function(){
		return this.tools;
	},
	getControls : function(){
		return this.controls;
	},
	getInput : function(){
		return this.input;
	},
};
