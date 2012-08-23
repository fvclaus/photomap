// Album is itself stored on the Map and contains several places (which are stored on the map too)
Album = function(data){
    this.title = data.title;
    this.id = data.id;
    this.desc = data.description;
    
    this.marker = new Marker({
	lat: parseFloat(data.lat),
	lng: parseFloat(data.lon),
	title: this.title
    });

    this.bindListener();
    this.checkIconStatus();
};

Album.prototype = {
    bindListener: function(){
	instance = this;
	console.log("id " + this.id);
	google.maps.event.addListener(this.marker.MapMarker, "click", function(){
	    console.log(instance.id);
	    /*window.location.href="/view-album"
	    main.getClientServer()._getPlaces( function(this.id) {
		instance._showPlaces();
	    });*/
	});
    },

    showVisitedIcon : function(){
	this.marker.set({icon: "static/images/camera-visited.png"});
    },

    checkIconStatus : function(){
	this.showVisitedIcon();
    },

};
