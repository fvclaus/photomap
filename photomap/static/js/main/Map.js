Map	= function() {		
    // google.maps.Map
    this.map			= null;
    // the DOM element
    this.$mapEl			= $('#map');
    this.$mapEl.data({
	originalWidth	: this.$mapEl.width(),
	originalHeight	: this.$mapEl.height()
    });
    // the map options
    this.mapOptions 	= {
	mapTypeId					: google.maps.MapTypeId.ROADMAP,
	mapTypeControl				: true,
	mapTypeControlOptions		: {
	    style		: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
	    position	: google.maps.ControlPosition.TOP_CENTER
	},
	panControl					: true,
	panControlOptions			: {
	    position	: google.maps.ControlPosition.TOP_LEFT
	},
	zoomControl					: true,
	zoomControlOptions			: {
	    style		: google.maps.ZoomControlStyle.SMALL,
	    position	: google.maps.ControlPosition.TOP_LEFT
	},
	streetViewControl			: true,
	streetViewControlOptions	: {
	    position	: google.maps.ControlPosition.TOP_LEFT
	}
    }
    //user is guest
    if (!main.getClientState().isAdmin()){
	this.mapOptions.styles = [
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
    }



    // mode : fullscreen || normal
    this.mode			= 'normal';	
    this._create();
    this.bindListener();
    
    
};

Map.prototype = {
    // initialize the google.maps.Map instance.
    _create				: function() {

	this.map 		= new google.maps.Map( this.$mapEl[0], this.mapOptions );
	this.maptype = google.maps.MapTypeId.ROADMAP;
	this.SATELLITE =  google.maps.MapTypeId.SATELLITE;
	this.ROADMAP = google.maps.MapTypeId.ROADMAP;

	//define overlay to retrieve pixel position on mouseover event
	this.overlay = new google.maps.OverlayView();
	this.overlay.draw = function() {};
	this.overlay.setMap(this.map);
    },
    bindListener : function(){
	var instance 	= this;
	this.places = new Array();

	if (main.getClientState().isAdmin()){
	    //create new place with description and select it 
	    google.maps.event.addListener(this.map,"click",function(event){

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
		    place.id = data["id"]
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
			//redraws place
			place.triggerClick();
		    });
		});

		input.get("/insert-place");
	    });
	}
    },
    getInstance			: function() {
	return this.map;
    },
    // takes an array of markers and resizes + pans the map so all places markers are visible
    // does not show/hide marker 
    fit : function( markersinfo ) {
	var markersinfo 	= markersinfo || this.markersinfo;
	this.markersinfo	= markersinfo;
	var LatLngList = new Array();

	for( var i = 0, len = markersinfo.length; i < len; ++i ) {
	    var minfo	= markersinfo[i];
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
    }

};
