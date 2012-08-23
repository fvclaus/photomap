ClientServer = function() {
	// array of places
	this.places = new Array();
};

ClientServer.prototype = {
	init				: function() {
	    var instance 	= this;
	    // make an AJAX call to get the places from the XML file, and display them on the Map
	    this._getPlaces( function() {
		instance._showPlaces();
	    });
	},
   	 savePhotos : function(photos){
	$.ajax({
	    url : "/update-photos",
	    type : "post",
	    data : {
		"photos" : JSON.stringify(photos)
	    }
	});
  	  },

	_getPlaces			: function(callback ) {
	    var instance = this;
	    // get the places and its info from the XML file
	    url = 'get-album?id=' + helperFunctions.getParameterByName('id');
	    $.getJSON(url, function( data ) {
		// the album name
		instance.name = data.title;
		instance.id = data.id;
		// the album description
		instance.desc = data.description;
		
		if (data.places == undefined) {
		    var map = main.getMap().getInstance();
		    lat = data.lat;
		    lon = data.lon;
		    lowerLatLng = new google.maps.LatLng(lat - .1,lon - .1);
		    upperLatLng = new google.maps.LatLng(lat + .1,lon + .1);
		    bounds = new google.maps.LatLngBounds(lowerLatLng,upperLatLng);
		    map.fitBounds(bounds);
		    x = ( $("#mp-map").width() * 0.25 );
		    y = 0;
		    map.panBy(x,y);
		    return;
		}
		
		$.each( data.places, function( key, placeinfo ) {
		    var place = new Place( placeinfo )
		    instance.places.push( place );
		});
		
		if( callback ) callback.call();
	    });
	    
	},
	_showPlaces			: function() {
	    var map 			= main.getMap();
	    markersinfo		= [];
	    map.places = this.places;	    

	    map.places.forEach(function(place){
		console.dir(place.photos);
		copy = place.photos;
		noOrder = new Array();
		place.photos = new Array();
		copy.forEach(function(photo,index){
		    if (photo.order && parseInt(photo.order) != NaN){
			place.photos[photo.order] = photo;
		    }
		    else{
			noOrder.push(photo);
		    }
		});

		noOrder.forEach(function(photo){
		    if (photo == null){
			return;
		    }
		    nullIndex = arrayExtension.firstUndef(place.photos);
		    if (nullIndex != -1){
			place.photos[nullIndex] = photo;
		    }
		    else {
			place.photos.push(photo);
		    }
		});
		console.dir(place.photos);
		marker	= place.marker;
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
