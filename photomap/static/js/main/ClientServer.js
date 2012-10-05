ClientServer = function() {
	// array of albums
	this.albums = new Array();
};

ClientServer.prototype = {
	init : function() {
	  
		// make an AJAX call to get the places from the XML file, and display them on the Map
		this._getAlbums();
	},
	_getAlbums : function() {
	    var instance = this;
	    // get the albums and their info
	    $.getJSON('get-all-albums', function( albums ) {
		
				// in case there are no albums yet show world map
				if (albums == undefined){
						map = main.getMap().getInstance();
						map.showWorld();
						return;
				}
				
				$.each( albums, function( key, albuminfo ) {
						var album = new Album( albuminfo )
						instance.albums.push( album );
				});
				
				main.getUIState().setAlbums(instance.albums);

				instance._showAlbums(instance.albums);
		
		});
	},
	_showAlbums : function(albums) {
	   var map = main.getMap();
	   map.showAsMarker(albums);
	},
	
	getShareLink : function(url,id){
	    data = {'id': id};
	    // get request for share link - data is album id
	    $.ajax({
		type: "get",
		dataType: "json",
		"url": url,
		"data": data,
		success : function(data){
		    if (data.error){
			alert(data.error);
		    }
		    else{
			main.getUIState().setAlbumShareURL(data.url,id);
			main.getUI().getTools().openShareURL();
		    }
		},
		error : function(err){
		    alert(err.toString());
		},
	    });
	},
};
