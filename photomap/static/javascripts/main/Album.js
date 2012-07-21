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

    var instance = this;
    // click event for place (its marker)
    // in the eventcallback this will be the gmap
    // use instance as closurefunction to access the place object
    google.maps.event.addListener( this.marker.MapMarker, 'click', function() {

	var map = main.getMap();
	var oldAlbum = main.getUIState().getCurrentAlbum();

	//close slideshow if open
	main.getUI().getSlideshow().closeSlideshow();

	// clear gallery photos + slider and map.place
	instance._clear();
	main.getUIState().setCurrentAlbum(instance);

	// set title in mp-controls bar
	information = main.getUI().getInformation();
	information.setInfo(instance);
	information.hideImageNumber();
	main.getUI().getControls().showControls();
	
	//change icon of new place
	instance.checkIconStatus();
	// change icon of old place
	if (oldAlbum)
	    oldAlbum.checkIconStatus();

	instance._showGallery();

    });

    this.checkIconStatus();
    
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
	map.panTo(this.marker.MapMarker.getPosition());
	
    },
    checkIconStatus : function(){
	var status = true;

	if (main.getUIState().getCurrentPlace() === this)
	    this.showSelectedIcon();
	else if (status)
	    this.showVisitedIcon();
	else
	    this.showUnselectedIcon();
    }
};
