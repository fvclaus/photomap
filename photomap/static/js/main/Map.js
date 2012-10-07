/*
 * @author Frederik Claus
 * @class Map provides an interface to the google.maps services
 */
Map	= function() {		
	// google.maps.Map
	this.map			= null;
	// google.maps.StreetViewPanorama
	this.panorama = null;
	// the DOM element
	this.$mapEl			= $('#map');
	this.$mapEl.data({
		originalWidth	: this.$mapEl.width(),
		originalHeight	: this.$mapEl.height()
	});
	this.ZOOM_OUT_LEVEL = 8;
	// the map options
	this.mapOptions 	= {
		mapTypeId : google.maps.MapTypeId.ROADMAP,
		mapTypeControl : true,
		mapTypeControlOptions : {
			style : google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
			position : google.maps.ControlPosition.TOP_LEFT
		},
		panControl : true,
		panControlOptions : {
			position : google.maps.ControlPosition.TOP_LEFT
		},
		zoomControl : true,
		zoomControlOptions : {
			style : google.maps.ZoomControlStyle.SMALL,
			position : google.maps.ControlPosition.TOP_LEFT
		},
		streetViewControl : true,
		streetViewControlOptions : {
			position : google.maps.ControlPosition.TOP_LEFT
		}
	};

	// mode : fullscreen || normal
	this.mode = 'normal';
	this._create();
    
    
};

Map.prototype = {
    // initialize the google.maps.Map instance.
	_create : function() {

		this.map = new google.maps.Map( this.$mapEl[0], this.mapOptions );
		this.maptype = google.maps.MapTypeId.ROADMAP;
		this.SATELLITE =  google.maps.MapTypeId.SATELLITE;
		this.ROADMAP = google.maps.MapTypeId.ROADMAP;
		// get hold of the default google.maps.StreetViewPanorama object
		this.panorama = this.getInstance().getStreetView();
		//define overlay to retrieve pixel position on mouseover event
		this.overlay = new google.maps.OverlayView();
		this.overlay.draw = function() {};
		this.overlay.setMap(this.map);
	},
	createLatLng : function(lat,lng){
		return new google.maps.LatLng(lat,lon);
	},
	//~ setBounds : function(latlng1,latlng2) {
		//~ bounds = new google.maps.LatLngBounds(latlng1,latlng2);
		//~ this.map.fitBounds(bounds);
		//~ x = ( $("#mp-map").width() * 0.25 );
		//~ y = 0;
		//~ this.map.panBy(x,y);
	//~ },
	
	setZoom : function(level){
		this.setZoom(level);
	},
	showAsMarker : function(elements){
		var markersInfo = new Array();
		elements.forEach(function(element){
			element.marker.show();
			markersInfo.push({
				lat : element.lat,
				lng : element.lng
			});
		});
		this.fit(markersInfo);
	},
	showWorld : function(){
		lowerlatlng = new google.maps.LatLng(-50,-90);
		upperlatlng = new google.maps.LatLng(50,90);
		bounds = new google.maps.LatLngBounds(lowerlatlng,upperlatlng);
		this.map.fitBounds(bounds);
	},
	zoomOut : function(lat,lng){
		center = new google.maps.LatLng(lat,lng)
		this.map.setCenter(center);
		this.setZoom(this.ZOOM_OUT_LEVEL);
	},
		
	getInstance : function() {
		return this.map;
	},
	getPanorama : function() {
		return this.panorama;
	},
	bindListener : function(){
		var instance 	= this;
		
		var state = main.getUIState();
		
		this.places = new Array();
		this.albums = new Array();
			
		google.maps.event.addListener(this.map,"click",function(event){
			
			main.getUI().
				//create new place with description and select it 
			if (!state.isDashboard()){
			
				var input = main.getUI().getInput();
				var lat = event.latLng.lat();
				var lng = event.latLng.lng();
				// declare beforehand so accessible in both closures
				var place;

				input.onAjax(function(data){
						if (!data){
					alert ("could not get id for newly inserted place");
						}
						console.log("received id %d",data["id"]);
						place.id = data["id"];
				});
				
				input.onLoad(function(){
					
					$("input[name=lat]").val(lat);
					$("input[name=lon]").val(lng);
					// was machen eigentlich die album daten im clientserver ??
					$("input[name=album]").val(main.getClientServer().id);

					input.onForm(function(){
						//get place name + description
						var name = $("[name=title]").val();
						var desc = $("[name=description]").val();
						//create new place and show marker
						//new place accepts only lon, because it handles responses from server
						place = new Place({
								lat: lat,
								lon: lng,
								"title" : name,
								"description" : desc
						});
						place.marker.show();
						input._close();
						state.addPlace(place);
						//redraws place
						place.triggerClick();
					});
				});

			input.get("/insert-place");
		}
		// create a new album
		else {
		
			var input = main.getUI().getInput();
			var lat = event.latLng.lat();
			var lng = event.latLng.lng();
			// declare beforehand so accessible in both closures
			var album;
			
			input.onAjax(function(data){
				if (!data){
					alert ("could not get id for newly inserted album");
				}
				console.log("received id %d",data["id"]);
				album.id = data["id"];
				//redirect to new albumview
				album.triggerClick();
			});
		
			input.onLoad(function(){
				$("input[name=lat]").val(lat);
				$("input[name=lon]").val(lng);

				input.onForm(function(){
					//get album name + description
					var name = $("[name=title]").val();
					var desc = $("[name=description]").val();
					//create new album and show marker
					album = new Album({
							lat: lat,
							lon: lng,
							"title" : name,
							"description" : desc
					});
					album.marker.show();
					input._close();
				});
			});

			input.get("/insert-album");
		}
	});
	
    },
    panoramaListener : function(){
	instance = this;
	// close description and/or gallery when starting streetview
	google.maps.event.addListener(this.panorama,'visible_changed',function(){
	    album = main.getUI().getAlbum();
	    information = main.getUI().getInformation();
	    state = main.getUIState();
	    if ( instance.panorama.getVisible() ) {
		if ( information.isVisible() ){
		$("#mp-description").hide();
		}
		if ( album.isVisible() ){
		    $("#mp-album").hide();
		    state.setGalleryLoaded(true);
		}
		else if ( !album.isVisible() ) {
		    state.setGalleryLoaded(false);
		}
	    }
	    else {
		if ( state.isGalleryLoaded() ) {
		    $("#mp-album").fadeIn(500);
		}
	    }
	});
    },
    // takes an array of markers and resizes + pans the map so all places markers are visible
    // does not show/hide marker 
    fit : function( markersinfo ) {
	var markersinfo = markersinfo || this.markersinfo;
	this.markersinfo = markersinfo;
	var LatLngList = new Array();

	for( var i = 0, len = markersinfo.length; i < len; ++i ) {
	    var minfo = markersinfo[i];
	    LatLngList.push( new google.maps.LatLng ( minfo.lat , minfo.lng ) );
	}
	// create a new viewpoint bound
	var bounds = new google.maps.LatLngBounds ();

	// go through each...
	for ( var i = 0, LtLgLen = LatLngList.length; i < LtLgLen; ++i ) {
	    // And increase the bounds to take this point
	    bounds.extend( LatLngList[i] );
	}
	// fit these bounds to the map
	this.map.fitBounds( bounds );
    },
    getOverlay : function(){
	return this.overlay;
    },
    getZoom : function(){
	return this.map.getZoom();
    },
    getProjection : function(){
	return this.map.getProjection();
    },
    getBounds : function(){
	return this.map.getBounds();
    },
    setControls : function(type,pan,zoom,streetview){
	this.map.setOptions({
	    mapTypeControl : type,
	    panControl : pan,
	    zoomControl : zoom,
	    streetViewControl : streetview,
	});
    },
    placeControls : function(type,pan,zoom,streetview){
	// if position == undefined -> no change
	this.map.setOptions({
	mapTypeControlOptions : {
	    position : type,
	},
	panControlOptions : {
	    position : pan,
	},
	zoomControlOptions : {
	    style : google.maps.ZoomControlStyle.SMALL,
	    position : zoom,
	},
	streetViewControlOptions : {
	    position : streetview,
	}
	});
    },
    setGuestStyle: function(){
	guestStyle = [
	    {
		featureType: "road",
		elementType:"labels",
		stylers: [
		    { visibilty: "simplified"}
		]
	    },
	    {
		featureType : "poi",
		elementType : "labels",
		stylers : [
		    {visibility:"simplified"}
		]
	    },
	    {
		featureType : "road.highway",
		stylers :[
		    {visibility:"off"}
		]
	    }
	];
	this.map.setOptions({
	    styles: guestStyle,
	});
    },
};
