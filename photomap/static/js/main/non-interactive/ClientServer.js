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
	$.getJSON("get-all-albums",function(albums) {
	    
	    if (albums == undefined){
		map = main.getMap().getInstance();
		lowerlatlng = new google.maps.LatLng(-50,-90);
		upperlatlng = new google.maps.LatLng(50,90);
		bounds = new google.maps.LatLngBounds(lowerlatlng,upperlatlng);
		map.fitBounds(bounds);
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
