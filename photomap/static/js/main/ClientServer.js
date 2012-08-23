ClientServer = function() {
	// array of albums
	this.albums = new Array();
};

ClientServer.prototype = {
	init				: function() {
	    var instance 	= this;
	    // make an AJAX call to get the places from the XML file, and display them on the Map
	    this._getAlbums( function() {
		instance._showAlbums();
	    });

	  
	},

	_getAlbums			: function( callback ) {
	    var instance = this;
	    // get the albums and their info
	    $.getJSON('get-all-albums', function( data ) {
		
		$.each( data, function( key, albuminfo ) {
		    /*console.log("key " + key + " - info " + albuminfo);
		    console.log("id " + albuminfo.id);
		    console.log("title " + albuminfo.title);*/
		    var album = new Album( albuminfo )
		    instance.albums.push( album );
		});
		
		if( callback ) callback.call();
		
	    });
	    
	},
	_showAlbums			: function() {
	    var map 			= main.getMap();
	    markersinfo		= [];
	    map.albums = this.albums;	    

	    map.albums.forEach(function(album){
		console.dir(album);
		marker	= album.marker;
		markersinfo.push({
		    lat	: marker.lat,
		    lng	: marker.lng
		});
		marker.show();
	    });
	    map.fit(markersinfo);
	}
};
