ClientServer = function() {
	// array of places
	this.places = new Array();
};

ClientServer.prototype = {
	init : function() {
	    var instance = this;
	    // make an AJAX call to get the places from the XML file, and display them on the Map
	    this._getPlaces( function() {
		instance._showPlaces();
	    });
	},
	savePhotoOrder : function(photos){
	    photos.forEach(function(photo){
		// post request for each photo with updated order
		$.ajax({
		    url : "/update-photo",
		    type : "post",
		    data : {
			'id': photo.id,
			'title': photo.name,
			'order': photo.order,
		    }
		});
	    });
  	  },
	_getPlaces			: function(callback ) {
	    var instance = this;
	    tools = main.getUI().getTools();
	    id = tools.getUrlParameterByName('id');
	    secret = tools.getUrlParameterByName('secret');
	    url = 'get-album?id=' + id + '&secret=' + secret;
	    $.getJSON(url, function( album ) {
		
		// define album new, so that property names are congruent with the property names of Place and Photo
		album.name = album.title;
		album.desc = album.description;
		// set current album in UIState to have access on it for information, etc.
		main.getUIState().setCurrentAlbum(album);
		// set album title in title-bar
		main.getUI().getInformation().setAlbumTitle(album.name);
		
		// the album name, description and id as ClientServer Property
		instance.name = album.name;
		instance.id = album.id;
		instance.desc = album.desc;
		
		// in case there are no places yet show map around album marker
		if (album.places == undefined) {
		    var map = main.getMap().getInstance();
		    lat = album.lat;
		    lon = album.lon;
		    lowerLatLng = new google.maps.LatLng(lat - .1,lon - .1);
		    upperLatLng = new google.maps.LatLng(lat + .1,lon + .1);
		    bounds = new google.maps.LatLngBounds(lowerLatLng,upperLatLng);
		    map.fitBounds(bounds);
		    x = ( $("#mp-map").width() * 0.25 );
		    y = 0;
		    map.panBy(x,y);
		    return;
		}
		
		$.each( album.places, function( key, placeinfo ) {
		    var place = new Place( placeinfo )
		    instance.places.push( place );
		});
		// add to UIState
		main.getUIState().setPlaces(instance.places);
		
		if( callback ) callback.call();
	    });
	    
	},
	_showPlaces : function() {
	    var map = main.getMap();
	    markersinfo = [];
	    map.places = this.places;	    

	    map.places.forEach(function(place){
		console.dir(place.photos);
		copy = place.photos;
		noOrder = new Array();
		place.photos = new Array();
		copy.forEach(function(photo,index){
		    if (photo.order && parseInt(photo.order) != NaN){
			place.photos[photo.order] = photo;
		    }
		    else{
			noOrder.push(photo);
		    }
		});

		noOrder.forEach(function(photo){
		    if (photo == null){
			return;
		    }
		    nullIndex = arrayExtension.firstUndef(place.photos);
		    if (nullIndex != -1){
			place.photos[nullIndex] = photo;
		    }
		    else {
			place.photos.push(photo);
		    }
		});
		console.dir(place.photos);
		marker	= place.marker;
		markersinfo.push({
		    lat	: marker.lat,
		    lng	: marker.lng
		});
		marker.show();
	    });
	    map.fit(markersinfo);
	},
	reloadAlbum : function(){
	    place = main.getUIState().getCurrentLoadedPlace();
	    console.log(place);
	    this._getPlaces();
	    this._showPlaces();
	    place.triggerClick();
	},
	handleUpload : function(repeat){
	    // get input values
	    $form = ("form.mp-dialog");
	    inputValues = {
		'id' : $form.find("input[name='place']").val(),
		'title' : $form.find("input[name='title']").val(),
		'desc' : $form.find("input[name='description']").val()
	    };
	    // get FormData-Object for Upload
	    data = this.getUploadData(inputValues,'photo');
	    // close fanybox and reopen if repeat = true
	    startHandler = function(){
		$.fancybox.close();
		//main.getUIState().setFileToUpload(null);
		if (repeat) {
		    $(".mp-option-add").trigger('click');
		}
	    };
	    // give user feedback about progress
	    progressHandler = function(event){
		if (event.lengthComputable){
		    var percentageUploaded = parseInt(100 - (event.loaded / event.total * 100));
		    console.log('Upload-Status: ' + percentageUploaded + '%');
		}
	    };
	    // reload place -> to show new photos in gallery
	    loadHandler = function(){
		alert('Photo-Upload finished');
	    };
	    
	    // send upload
	    this.sendUpload(data,startHandler,progressHandler,loadHandler);
	},
	getUploadData : function(params,fileType){
	    state = main.getUIState();
	    data = new FormData();
	    
	    data.append('place', params.id);
	    data.append('title', params.title);
	    data.append('description', params.desc);
	    /*
	     * due to using the FormData() - Object there is no 
	     * need to read the photo first (Filereader API), save it into 
	     * memory and encode it manually, in order to send it
	     * in case a browser we want to support doesn't have FormData
	     * -> we have to user Filereader as Fallback or add FormData-Object + Prototype
	     */
	    data.append(fileType, state.getFileToUpload());
	    
	    return data;
	},
	sendUpload : function(data,start,progress,done){
	    request = new XMLHttpRequest();
	    upload = request.upload;
	    
	    // don't proceed if browser doesnt support new XMLHttpRequest Level 2
	    if (!upload) {
		alert('Your browser does not support XMLHttpRequest Level 2 upload');
		return;
	    }
	    
	    // handler called after upload is started
	    upload.addEventListener('loadstart',start);
	    // handler for the upload progress
	    upload.addEventListener('progress',progress);
	    // handler called after all bytes are sent
	    upload.addEventListener('load',done);
	    upload.onreadystatechange = function(e){
		// readyState == 4 -> data-transfer completed
		if (request.readyState == 4){
		    // alert error if upload wasn't successful
		    if (request.status != 200){
			text = JSON.parse(request.responseText);
			error = request.status;
			alert("The upload didn't work. " + error + " " + text);
		    }
		}
	    };
	    // define method and url - true is for asynchronous 
	    request.open('post','/insert-photo',true);
	    // send formdata to server
	    request.send(data);
	},
};
