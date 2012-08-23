// Album is itself stored on the Map
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
	var instance = this;
	google.maps.event.addListener(this.marker.MapMarker, "click", function(){
	    url = '/view-album?id=' + instance.id;
	    window.location.href=url;
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
