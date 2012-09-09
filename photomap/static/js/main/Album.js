// Album is itself stored on the Map
Album = function(data){
    this.name = data.title;
    this.id = data.id;
    this.desc = data.description;
    
    this.marker = new Marker({
	lat: parseFloat(data.lat),
	lng: parseFloat(data.lon),
	title: this.title
    });

    this.checkIconStatus();
    this.bindListener();
};

Album.prototype = {
    _delete : function(){
	this.marker.hide();
    },
    bindListener: function(){
	var instance = this;
	var state = main.getUIState();
	var controls = main.getUI().getControls();
	
	// redirect on albumview of selected album
	google.maps.event.addListener(this.marker.MapMarker, "click", function(){
	    
	    state.setCurrentAlbum(instance);
	    
	    url = '/view-album?id=' + instance.id;
	    window.location.href=url;
	});

	google.maps.event.addListener(this.marker.MapMarker, "mouseover", function(event){
	    
	    state.setCurrentAlbum(instance);
	    
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

	    controls.setModifyAlbum(true);
	    controls.showControls({top:pixel.y,left:pixel.x});
	});

	google.maps.event.addListener(this.marker.MapMarker, "mouseout", function(){
	    controls.hideControls(true);
	});
    },
    triggerClick : function(){
	var map = main.getMap();
	google.maps.event.trigger(this.marker.MapMarker,"click");
    },
    center : function(){
	var map = main.getMap().getInstance();
	map.setZoom(13);
	map.panTo(this.marker.MapMarker.getPosition());
    },
    showVisitedIcon : function(){
	this.marker.set({icon: "static/images/camera-visited.png"});
    },

    checkIconStatus : function(){
	this.showVisitedIcon();
    },

};
