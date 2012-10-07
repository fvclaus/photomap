ClientServer = function(){
    this.albums  = new Array();
};

ClientServer.prototype = {
    init: function(){
	var instance = this;
	this._getAlbums(function(){
	    instance._showAlbums();
	});
    },
    _getAlbums: function(callback){
	var instance = this;
	$.ajax({
		"url":"get-all-albums",
		"async": false,
		success : function(albums) {
	    
	    // in case there are no albums yet show world map
	    if (albums == undefined){
		map = main.getMap().getInstance();
		map.showWorld();
		return;
	    }
		
	    albums.forEach(function(data){
		instance.albums.push(new Album(data));
	    });
	    
	    if (callback) callback.call();
	});
    },
    _showAlbums: function(){
	var map = main.getMap();
	map.albums = this.albums;
	markersinfo = new Array();
	
	map.albums.forEach(function(album){
	    console.dir(album);
	    marker = album.marker;
	    markersinfo.push({
		lat: marker.lat,
		lng: marker.lng
	    });
	    marker.show();
	});
	map.fit(markersinfo);
    }
};
