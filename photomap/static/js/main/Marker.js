// abstract marker either represents a place or photo
Marker = function(data) {	
    this._create(data);
};

Marker.prototype = {
    _create : function( data ) {
	var map = main.getMap();
	
	// latitude and longitude
	this.lat = data.lat;
	this.lng = data.lng;
	// title
	this.title = data.title;
	tools = main.getUI().getTools();
	// custom icons for the map markers
	this.mapicon = new google.maps.MarkerImage(MARKER_DEFAULT_ICON);
	console.dir(data);
	this.MapMarker = new google.maps.Marker({
	    position : new google.maps.LatLng ( this.lat , this.lng ),
	    map : map.getInstance(),
	    icon : this.mapicon,
	    title : this.title
	});
	// don't show for now
	this.MapMarker.setMap(null);
	
    },
    show : function() {
	var map = main.getMap();
	this.MapMarker.setMap( map.getInstance() );
    },
    hide	: function() {
	this.MapMarker.setMap( null );
    },
    setOption	: function( options ) {
	if( typeof options.icon != 'undefined' )
	    this.MapMarker.setIcon(new google.maps.MarkerImage(options.icon));
	if( typeof options.zindex != 'undefined' )
	    this.MapMarker.setZIndex(options.zindex);
    },
    getPosition  : function(){
	return this.MapMarker.getPosition();
    },
    getSize : function(){
	return this.MapMarker.getIcon().size;
    },
    getMarker : function(){
	return this.MapMarker;
    }
};

