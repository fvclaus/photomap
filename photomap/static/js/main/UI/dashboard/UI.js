UI = function (){
	this.tools = new UITools();
	this.panel = new UIPanel();
	this.controls = new UIControls(this.panel.getControlsBarHeight());
	this.input = new UIInput();
	this.state = new UIState(this);
}

UI.prototype = {

	init : function(){
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
	getState: function(){
		return this.state;
	},
	getInformation: function(){
		return null;
	},
};
