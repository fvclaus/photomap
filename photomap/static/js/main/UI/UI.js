UI = function (){
	this.tools = new UITools();
	this.panel = new UIPanel();
	this.controls = new UIControls();
	this.input = new UIInput();
	this.state = new UIState(this);
	this.cursor = new UICursor();
}

UI.prototype = {

    init : function(){
	this.panel.init();
	this.controls.init();
	this.cursor.init();
    },
    getCursor : function(){
	return this.cursor;
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
    getPanel : function(){
	return this.panel;
    },
};
