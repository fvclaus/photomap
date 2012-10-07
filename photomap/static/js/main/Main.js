/*
 * @author Frederik Claus
 * @class Starts the application. Retrieves all objects from server and intialises the rest afterwards. The constructor must be called after dom is ready.
 */
Main = function(){

    this.clientState =  new ClientState();
    // instance of Map
    this.clientServer = new ClientServer();
    // instance of Menu
    this.ui= new UI();
    
};

Main.prototype = {
	init : function(){
		this.map = new Map();
		this.clientServer.init();
		// initialise UI
		this.ui.init();
		// do some page specific stuff
		if (typeof initialize !== "undefined"){
			initialize();
		}
		//initialize test, if they are present
		if (typeof initializeTest !== "undefined"){
			initializeTest();
		}
	},
	getUIState : function(){
		return this.ui.getState();
	},
	getClientState : function(){
		return this.clientState;
	},
	getClientServer : function(){
		return this.clientServer;
	},
	getMap : function(){
		return this.map;
	},
	getUI : function(){
		return this.ui;
	},
};

