ClientServer = function() {
	// array of places
	this.uploadedPhotos = new Array();
};

ClientServer.prototype = {
	init : function() {
		// make an AJAX call to get the places from the XML file, and display them on the Map
		this._getPlaces();
	},
	savePhotoOrder : function(photos){
	    photos.forEach(function(photo){
		// post request for each photo with updated order
		$.ajax({
		    url : "/update-photo",
		    type : "post",
		    data : {
			'id': photo.id,
			'order': photo.order,
		    }
		});
	    });
  	  },
	_getPlaces			: function( ) {
	    var instance = this;
	    tools = main.getUI().getTools();
	    id = tools.getUrlId();
	    secret = tools.getUrlSecret();
	    
	    $.ajax({
			"url" : "get-album",
			data : {
				"id" : id,
				"secret" : secret
				},
			success: function( album ) {
				// define album new, so that property names are congruent with the property names of Place and Photo
				album.title = album.title;
				album.description = album.description;
				// set current album in UIState to have access on it for information, etc.
				main.getUIState().setCurrentAlbum(album);
				// set album title in title-bar
				main.getUI().getInformation().updateAlbumTitle();
				
				// the album name, description and id as ClientServer Property
				//instance.name = album.name;
				//instance.id = album.id;
				//instance.desc = album.desc;
				
				// in case there are no places yet show map around album marker
				if (album.places == undefined) {
					var map = main.getMap();
					map.zoomOut(album.lat,album.lon);
					//~ lat = album.lat;
					//~ lon = album.lon;
					//~ lowerLatLng = map.createLatLng(lat - .1,lon - .1);
					//~ upperLatLng = map.createLatLng(lat + .1,lon + .1);
					//~ map.setBounds(lowerLatLng,upperLatLng);
					return;
				}
				
				var places = new Array();
				
				$.each( album.places, function( key, placeinfo ) {
					var place = new Place( placeinfo )
					places.push( place );
				});
				// add to UIState
				main.getUIState().setPlaces(places);
				
				instance._showPlaces(places)
	    });
	    
	},
	_showPlaces : function(places) {
		var map = main.getMap();
		
		places = this._sortPhotos(places);
		map.showAsMarker(places);
	},
	
	_sortPhotos : function(places){
		
		places.forEach(function(place){
			console.dir(place.photos);
			copy = place.photos;
			noOrder = new Array();
			place.photos = new Array();
			// puts photos with order on the right position
			// order : 6 place.photos[5] = photo
			copy.forEach(function(photo,index){
				if (photo.order && parseInt(photo.order) != NaN){
					place.photos[photo.order] = photo;
				}
				else{
					noOrder.push(photo);
				}
			});
			// fills up null values in place.photo with fifo no order photos
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
		});
		
		return places;
	},
	handleUpload : function(repeat){
	    $form = $("form.mp-dialog");
	    // get input values
	    inputValues = {
		'id' : $form.find("input[name='place']").val(),
		'title' : $form.find("input[name='title']").val(),
		'description' : $form.find("textarea[name='description']").val()
	    };
	    
	    // add new photo object and set first values -> finished in responseHandler
	    var photo = new Photo(inputValues);
	    
	    // get FormData-Object for Upload
	    data = this.getUploadData(inputValues,'photo');
	    
	    // close fancybox and reopen if repeat = true
	    startHandler = function(){
		$.fancybox.close();
		main.getUIState().setFileToUpload(null);
		if (repeat) {
		    $(".mp-option-add").trigger('click');
		}
	    };
	    
	    // give user simple feedback about progress (smoothly change font-color and bg-color of title-bar)
	    progressHandler = function(event){
		if (event.lengthComputable){
		    var percentageUploaded = Math.round(event.loaded / event.total);
		    if (percentageUploaded <= 50){
			factor = (percentageUploaded * 2);
			rgbBgColor = 255 * factor;
			rgbFontColor = 255 - rgbBgColor;
			$(".mp-gallery-title-bar").css({
			    'background-color': 'rgba('+rgbBgColor+','+rgbBgColor+','+rgbBgColor+',.6)',
			    'color': 'rgba('+rgbFontColor+','+rgbFontColor+','+rgbFontColor+',1)'
			});
		    }
		    else{
			factor = ((percentageUploaded - 50) * 2);
			rgbFontColor = 255 * factor;
			rgbBgColor = 255 - rgbFontColor;
			$(".mp-gallery-title-bar").css({
			    'background-color': 'rgba('+rgbBgColor+','+rgbBgColor+','+rgbBgColor+',.6)',
			    'color': 'rgba('+rgbFontColor+','+rgbFontColor+','+rgbFontColor+',1)'
			});
		    }
		    console.log('Upload-Status: ' + percentageUploaded + '%');
		}
	    };
	    
	    // resets progress changes (=> normalize title-bar)
	    loadHandler = function(){
		$(".mp-gallery-title-bar").css({
		    'background-color': '#333',
		    'color': '#FFF'
		});
		console.log('Done');
	    };
	    // add photo to UIState and gallery and set listeners
	    responseHandler = function(response){
		state = main.getUIState();
		album = main.getUI().getAlbum();
		if(response.success){
		    // add received value to uploadedPhoto-Object and add it to UIState and current place
		    photo.source = response.url;
		    photo.id = response.id;
		    console.log(photo);
		    state.addPhoto(photo);
		    $(".mp-gallery img.mp-option-add").before('<img class="overlay-description sortable mp-control" src=' + response.url + '>');
		    // reinitialising ScrollPane, cause gallery length might have increased
		    if (album.getScrollPane()){
			album.getScrollPane().reinitialise();
		    }
		    else if (!album.getScrollPane() && state.getPhotos().length > 9){
			album.setScrollPane();
		    }
		    album.searchImages();
		    // set bindListener (won't be necessary anymore when upgrading to jQuery 1.7.2 and using .on()
		    album.bindListener();
		}
		else{
		    alert(response.error);
		}
	    };
	    
	    // send upload
	    this.sendUpload(data,startHandler,progressHandler,loadHandler,responseHandler);
	},
	getUploadData : function(params,fileType){
	    state = main.getUIState();
	    data = new FormData();
	    
	    data.append('place', params.id);
	    data.append('title', params.title);
	    data.append('description', params.description);
	    data.append(fileType, state.getFileToUpload());
	    
	    return data;
	},
	sendUpload : function(data,start,progress,load,done){
	    
	    // create a request-object which is also compatible to microsoft
	    request = main.getUI().getTools().createRequest();
	    if (!request){
		return;
	    }
	    upload = request.upload;
	    // don't proceed if browser doesnt support new XMLHttpRequest Level 2
	    if (!upload){
		alert('Your browser does not support XMLHttpRequest Level 2 upload. Please upgrade to a newer version.');
		return;
	    }
	    
	    // handler called after upload is started
	    upload.addEventListener('loadstart',start);
	    // handler for the upload progress
	    upload.addEventListener('progress',progress);
	    // handler called after all bytes are sent
	    upload.addEventListener('load',load);
	    request.onreadystatechange = function(e){
		// readyState == 4 -> data-transfer completed and response fully received
		if (request.readyState == 4){
		    if (request.status == 200){
			done(JSON.parse(request.responseText));
		    }
		    // alert error if upload wasn't successful
		    else {
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
