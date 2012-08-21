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
	google.maps.event.addListener(this.marker.MapMarker, "click", function(){
	});
    },

    showVisitedIcon : function(){
	this.marker.set({icon: "static/images/camera-visited.png"});
    },

    checkIconStatus : function(){
	this.showVisitedIcon();
    },

};
