ClientState = function(){
    value = $.cookie("visited") || new String("");
    this._parseValue(value);
    this._year = 356 * 24 * 60 * 60 * 1000;
    this._cookieSettings = {
	expires : new Date().add({years : 1}),
	maxAge : this._year
    };
};

ClientState.prototype = {
    isAdmin : function(){
	// return true if user is owner of current album
	album = main.getUIState().getCurrentAlbum();
	return album.isOwner;
    },
    isOwner : function(album){ 
	return album.isOwner;
    },
    _parseValue : function(value){
	this.value  = value.split(",");
	var instance = this;
	this.photos = new Array();
	
	if (value != "") {
	    this.value.forEach(function(photo){
		instance.photos.push(parseInt(photo));
	    });
	}
    },
    isVisitedPhoto : function(id){
	index = this.photos.indexOf(id);
	if (index == -1)
	    return false;
	return true;
    },
    addPhoto : function(id){
	if (this.photos.indexOf(id) == -1){
	    this.photos.push(id);
	    this._writeCookie();
	}
    },
    _writeCookie : function(){
	this.value = this.photos.join(",");
	$.cookie("visited",this.value,this._cookieSettings);
    },
};
