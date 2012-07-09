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
	this.ui.init();
	this.clientServer.init();

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
