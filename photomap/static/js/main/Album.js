/*
 * @author Marc Roemer
 * @class Models an album that holds an unspecified amount of places
 */
Album = function(data){
	this.title = data.title;
	this.id = data.id;
	this.description = data.description;
    
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
		this.marker.setOption({icon: ALBUM_VISITED_ICON});
	},
	checkIconStatus : function(){
		this.showVisitedIcon();
	},
	/*
	 * @description Adds an listener to an event triggered by the Marker
	 * @param {String} event
	 * @param {Function} callback
	 */
	addListener : function(event,callback){
		if (!(event && callback)){
			alert("You must specify event as well as callback");
			return;
		}
		google.maps.event.addListener(this.marker.MapMarker,event,callback);
	},
};
