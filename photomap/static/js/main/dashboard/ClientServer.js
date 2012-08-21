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
	    // get the places and its info from the XML file
	    $.getJSON('get-all-albums', function( data ) {
		// the album name
		instance.name = data.title;
		instance.id = data.id;
		// the album description
		instance.desc = data.description;
		
		if( callback ) callback.call();
	    });
	    
	},
	_showAlbums			: function() {
	    var map 			= main.getMap();
	    markersinfo		= [];
	    map.places = this.albums;	    

	    map.places.forEach(function(album){
		
		marker	= album.marker;
		markersinfo.push({
		    lat	: marker.lat,
		    lng	: marker.lng
		});
		marker.show();
	    });
	    map.fit(markersinfo);
	    if (main.getUI().getInformation()) {
	    information = main.getUI().getInformation();
	    information.setInfo(this);
	    information.albumName = this.name;
	    information.albumDesc = this.desc;
	    }
	}
};
