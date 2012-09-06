ClientServer = function() {
	// array of places
	this.places = new Array();
};

ClientServer.prototype = {
	init : function() {
	    var instance = this;
	    // make an AJAX call to get the places from the XML file, and display them on the Map
	    this._getPlaces( function() {
		instance._showPlaces();
	    });
	},
	savePhotoOrder : function(photos){
	    photos.forEach(function(photo){
		// post request for each photo with updated order
		$.ajax({
		    url : "/update-photo",
		    type : "post",
		    data : {
			'id': photo.id,
			'title': photo.name,
			'order': photo.order,
		    }
		});
	    });
  	  },
	deleteObject : function(url,data){
	    // post request to delete album/place/photo - data is the id of the object
	    $.ajax({
		type : "post",
		dataType : "json",
		"url" : url,
		"data" : data,
		success : function(data){
		    if (data.error){
			alert(data.error);
		    }
		},
		error : function(err){
		    alert(err.toString());
		}
	    });
	},
	_getPlaces			: function(callback ) {
	    var instance = this;
	    tools = main.getUI().getTools();
	    url = 'get-album?id=' + tools.getUrlParameterByName('id');
	    $.getJSON(url, function( album ) {
		
		// define album new, so that property names are congruent with the property names of Place and Photo
		album.name = album.title;
		album.desc = album.description;
		// set current album in UIState to have access on it for information, etc.
		main.getUIState().setCurrentAlbum(album);
		// set album title in title-bar
		main.getUI().getInformation().setAlbumTitle(album.name);
		
		// the album name, description and id as ClientServer Property
		instance.name = album.name;
		instance.id = album.id;
		instance.desc = album.desc;
		
		// in case there are no places yet show map around album marker
		if (album.places == undefined) {
		    var map = main.getMap().getInstance();
		    lat = album.lat;
		    lon = album.lon;
		    lowerLatLng = new google.maps.LatLng(lat - .1,lon - .1);
		    upperLatLng = new google.maps.LatLng(lat + .1,lon + .1);
		    bounds = new google.maps.LatLngBounds(lowerLatLng,upperLatLng);
		    map.fitBounds(bounds);
		    x = ( $("#mp-map").width() * 0.25 );
		    y = 0;
		    map.panBy(x,y);
		    return;
		}
		
		$.each( album.places, function( key, placeinfo ) {
		    var place = new Place( placeinfo )
		    instance.places.push( place );
		});
		// add to UIState
		main.getUIState().setPlaces(instance.places);
		
		if( callback ) callback.call();
	    });
	    
	},
	_showPlaces : function() {
	    var map = main.getMap();
	    markersinfo = [];
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
	},
	reloadAlbum : function(){
	    place = main.getUIState().getCurrentLoadedPlace();
	    console.log(place);
	    this._getPlaces();
	    this._showPlaces();
	    place.triggerClick();
	},
};
