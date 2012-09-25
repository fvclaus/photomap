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
	console.log('value');
	console.log(this.value);
	var instance = this;

	//legacy parsing ; saved photo + place
	if (value.match(/photo|place/) ){
	    this.photos = new Array();
	    console.log('photos');
	    console.log(this.photos);
	    this.value.forEach(function(el){
		if (el.match(/photo/)){
		    console.log('legacy before push');
		    console.log(instance.photos);
		    instance.photos.push(parseInt(el.split("-")[1]));
		    console.log('legacy after push');
		    console.log(instance.photos);
		}
	    });
	}
	//new one saves only photo
	else {
	    this.photos = new Array();
	    if (value != "") {
		this.value.forEach(function(photo){
		    console.log('new before push');
		    console.log(instance.photos);
		    instance.photos.push(parseInt(photo));
		    console.log('new after push');
		    console.log(instance.photos);
		});
	    }
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
