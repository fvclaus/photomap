/*
 * @author: Frederik Claus
 * @class UI is a wrapper class for everything related to the album div, where all the pictures are shown
 * @requires UITools, UIPanel, UIControls, UIInput, UIState, UICursor
 * 
 */
UI = function (){
	this.tools = new UITools();
	this.panel = new UIPanel();
	this.controls = new UIControls();
	this.input = new UIInput();
	this.state = new UIState(this);
	this.cursor = new UICursor();
}

/*
 * @author Marc Roemer
 * @description Defines Getter to retrieve the UI classes wrapped
 */

UI.prototype = {
	/*
	 * @author Frederik Claus
	 * @description Initializes all UI Classes that need initialization after(!) every object is instantiated
	 */
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
