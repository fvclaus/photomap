ClientServer = function() {
	// array of albums
	this.albums = new Array();
};

ClientServer.prototype = {
	init : function() {
	    var instance = this;
	    // make an AJAX call to get the places from the XML file, and display them on the Map
	    this._getAlbums( function() {
		instance._showAlbums();
	    });	  
	},
	_getAlbums : function( callback ) {
	    var instance = this;
	    // get the albums and their info
	    $.getJSON('get-all-albums', function( albums ) {
		
		// in case there are no albums yet show world map
		if (albums == undefined){
		    map = main.getMap().getInstance();
		    lowerlatlng = new google.maps.LatLng(-50,-90);
		    upperlatlng = new google.maps.LatLng(50,90);
		    bounds = new google.maps.LatLngBounds(lowerlatlng,upperlatlng);
		    map.fitBounds(bounds);
		    return;
		}
		
		$.each( albums, function( key, albuminfo ) {
		    var album = new Album( albuminfo )
		    instance.albums.push( album );
		});
		
		main.getUIState().setAlbums(instance.albums);

		if( callback ) callback.call();
		
	    });
	},
	_showAlbums : function() {
	    var map = main.getMap();
	    markersinfo = [];
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
	},
	
	getShareLink : function(url,id){
	    data = {'id': id};
	    // get request for share link - data is album id
	    $.ajax({
		type: "get",
		dataType: "json",
		"url": url,
		"data": data,
		success : function(data){
		    if (data.error){
			alert(data.error);
		    }
		    else{
			main.getUIState().setAlbumShareURL(data.url);
			main.getUI().getTools().openShareURL();
		    }
		},
		error : function(err){
		    alert(err.toString());
		},
	    });
	},
};
