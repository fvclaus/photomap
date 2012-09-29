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
	var instance = this;
	oldValue  = value.split(",");
	this.photos = new Array();
	
	if (value != "") {
	    for (i=0; i < oldValue.length; i++){
		// in case there is a non-numeric value in the cookie
		if (!isNaN(oldValue[i])){
		    this.photos.push(parseInt(oldValue[i]));
		}
	    }
	    // rewrite cookie, just in case there was a change
	    this._writeCookie();
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
	    console.log(id);
	    this.photos.push(id);
	    this._writeCookie();
	}
    },
    _writeCookie : function(){
	console.log(this.photos);
	this.value = this.photos.join(",");
	$.cookie("visited",this.value,this._cookieSettings);
    },
};
