/*
 * @author Marc Roemer
 * @class Models an album that holds an unspecified amount of places
 */
Album = function(data){
	InfoMarker.call(this,data);
	this.checkIconStatus();
	this._bindListener();

};

Album.prototype = InfoMarker.prototype;

Album.prototype._delete = function(){
		this.marker.hide();
	};

	/*
	 * @private
	 */
Album.prototype._bindListener = function(){
		var instance = this;
		var state = main.getUIState();
		var controls = main.getUI().getControls();
		
		// redirect on albumview of selected album
		google.maps.event.addListener(this.marker.MapMarker, "click", function(){
				
				state.setCurrentAlbum(instance);
				
				url = '/view-album?id=' + instance.id;
				window.location.href=url;
		});
	};
	
	
Album.prototype.checkIconStatus = function(){
		this.showVisitedIcon();
	};
