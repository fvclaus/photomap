/*
  Place.js
  @author: Frederik Claus
  @summary: Place stores several pictures and is itself stored in the map
*/

Place = function(data) {
	this.title = data.title; // will be used for the Map Marker title (mouseover on the map)
	this.id = data.id;
	this.description = data.description;
    
	this.marker		= new Marker({
		lat		: parseFloat(data.lat), 
		lng		: parseFloat(data.lon),
		title	: this.title
	});

	this.photos = new Array();
	if (data.photos){
		for( var i = 0, len = data.photos.length; i < len; ++i ) {
	    this.photos.push( new Photo( data.photos[i],i ) );
		}
	}
    
	this.checkIconStatus();
	this._bindListener();
    
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
	center : function(){
		var map = main.getMap().getInstance();
		map.setZoom(ZOOM_LEVEL_CENTERED);
		console.log("position " + this.marker.MapMarker.getPosition());
		map.panTo(this.marker.MapMarker.getPosition());
		x = ( $("#mp-map").width() * 0.25 );
		y = 0;
		map.panBy(x,y);
	},
	_showGallery : function() {
		main.getUI().getAlbum().show( this.photos );
	},
	_clear  : function(){
		// hide galleryAlbum container if present
		main.getUI().getGallery().hide();
		// $("div.mp-gallery-outer").remove();
	},
	/*
	 * @description Shows the album on the map
	 */
	show : function(){
		this.marker.show();
	},
	showVisitedIcon : function(){
		this.marker.setOption({icon: PLACE_VISITED_ICON});
	},
	showSelectedIcon : function(){
		this.marker.setOption({icon: PLACE_SELECTED_ICON});
	},
	showUnselectedIcon : function(){
		this.marker.setOption({icon: PLACE_UNSELECTED_ICON});
	},
	showDisabledIcon : function(){
		this.marker.setOption({icon: PLACE_DISABLED_ICON});
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
	/*
	 * @private
	 */
	_bindListener : function(){

		var instance = this;
		var state = main.getUIState();
		var ui = main.getUI();
		var information = ui.getInformation();
		var controls = ui.getControls();
		// click event for place (its marker)
		// in the eventcallback this will be the gmap
		// use instance as closurefunction to access the place object
		google.maps.event.addListener( this.marker.MapMarker, 'click', function() {
				
			if (main.getUIState().isAlbumLoading()) {
				return;
			}

			var map = main.getMap();
			var oldPlace = state.getCurrentLoadedPlace();

			//close slideshow if open
			ui.getSlideshow().closeSlideshow();

			// clear gallery photos + slider and map.place
			instance._clear();
			state.setCurrentPlace(instance);
			state.setCurrentLoadedPlace(instance);
			
			controls.hideControls(false);
			// change icon of new place
			instance.checkIconStatus();
			// change icon of old place
			if (oldPlace){
				oldPlace.checkIconStatus();
			}
			instance._showGallery();

			// set and show title and description
			information.setPlaceTitle();
			information.setPlaceDescription();
			// expose gallery and description
			mpEvents.trigger("body",mpEvents.toggleExpose);
			});
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
