// place stores several pictures and is itself stored in the map
Place = function(data) {
    this.name = data.title; // will be used for the Map Marker title (mouseover on the map)
    this.id = data.id;
    this.desc = data.description;
    
    this.marker		= new Marker({
	lat		: parseFloat(data.lat), 
	lng		: parseFloat(data.lon),
	title	: this.name
    });


    this.photos = new Array();
    if (data.photos){
	for( var i = 0, len = data.photos.length; i < len; ++i ) {
	    this.photos.push( new Photo( data.photos[i],i ) );
	}
    }

    this.checkIconStatus();
    this.bindListener();
    
};

Place.prototype = {
    _delete : function(){
	this._clear();
	this.marker.hide();
    },
    triggerClick : function(){
	var map = main.getMap();
	google.maps.event.trigger(this.marker.MapMarker,"click");
    },

    showVisitedIcon : function(){
	this.marker.set({icon: "static/images/camera-visited.png"});
    },
    showSelectedIcon : function(){
	this.marker.set({icon: "static/images/camera-current.png"});
    },
    showUnselectedIcon : function(){
	this.marker.set({icon: this.marker.mapicon});
    },
    showDisabledIcon : function(){
	this.marker.set({icon: "static/images/camera-disabled.png"});
    },
    center : function(){
	var map = main.getMap().getInstance();
	map.setZoom(13);
	console.log("position " + this.marker.MapMarker.getPosition());
	map.panTo(this.marker.MapMarker.getPosition());
	x = ( $("#mp-map").width() * 0.25 );
	y = 0;
	map.panBy(x,y);
	
    },
    _showGallery		: function() {
	main.getUI().getAlbum().show( this.photos );
    },
    _clear  : function(){
	// hide galleryAlbum container if present
	main.getUI().getGallery().hide();
	// $("div.mp-gallery-outer").remove();
    },
    checkIconStatus : function(){
	var status = true;
	this.photos.forEach(function(photo){
	    status = status && photo.visited;
	});

	if (main.getUIState().getCurrentPlace() === this)
	    this.showSelectedIcon();
	else if (status)
	    this.showVisitedIcon();
	else
	    this.showUnselectedIcon();
    },
    bindListener : function(){

	var instance = this;
	// click event for place (its marker)
	// in the eventcallback this will be the gmap
	// use instance as closurefunction to access the place object
	google.maps.event.addListener( this.marker.MapMarker, 'click', function() {
	    
	    console.log(instance.id);
	    console.log(instance);
	    
	    if (main.getUIState().isAlbumLoading()) {
		return;
	    }

	    var map = main.getMap();
	    var oldPlace = main.getUIState().getCurrentPlace();

	    //close slideshow if open
	    main.getUI().getSlideshow().closeSlideshow();

	    // clear gallery photos + slider and map.place
	    instance._clear();
	    main.getUIState().setCurrentPlace(instance);

	    // set title in mp-controls bar
	    information = main.getUI().getInformation();
	    information.setPlaceTitle();
	    
	    main.getUI().getControls().hidePhotoControls(false);
	    //change icon of new place
	    instance.checkIconStatus();
	    // change icon of old place
	    if (oldPlace)
		oldPlace.checkIconStatus();

	    instance._showGallery();

	});

	google.maps.event.addListener(this.marker.MapMarker, "mouseover", function(event){
	    // gets the relative pixel position
	    projection = main.getMap().getOverlay().getProjection();
	    pixel = projection.fromLatLngToContainerPixel(instance.marker.getPosition());
	    // add the header height to the position
	    pixel.y += main.getUI().getPanel().getHeight();
	    // add the height of the marker
	    markerSize = instance.marker.getSize();
	    pixel.y += markerSize.height;
	    // add the width of the marker
	    pixel.x += markerSize.width/2;

	    controls =  main.getUI().getControls();
	    controls.setModifyPlace(true);
	    main.getUI().getState().setCurrentPlace(instance);
	    controls.showModifyControls({top:pixel.y,left:pixel.x});
	});

	google.maps.event.addListener(this.marker.MapMarker, "mouseout", function(){
	    main.getUI().getControls().hidePhotoControls(true);
	});

	
    },
};
