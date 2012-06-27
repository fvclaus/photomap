// photo is stored by in a place object, encapsulation of an marker
Photo = function(data,index) {
    this.thumb = data.thumb;
    this.source = data.source;
    this.name = data.name;
    this.desc = data.desc;
    this.id = data.id;
    this.order = data.order;
    this.visited = main.getClientState().isVisitedPhoto(this.id);
};

Photo.prototype = {
    checkBorder : function(){
	//need reselection because anchors change
	if (this.visited)
	    $("img[src='"+this.thumb+"']").addClass("visited");
    },
    showBorder : function(bool){
	this.visited = bool;
	main.getClientState().addPhoto(this.id);
	this.checkBorder();
    }
};

