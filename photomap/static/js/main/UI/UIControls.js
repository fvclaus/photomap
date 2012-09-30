UIControls = function(maxHeight) {
    
    this.$controls = $(".mp-controls-wrapper");
    this.$controls.hide();
    // icons of photo controls are not scaled yet
    this.$controls.isScaled = false;
    // tells the hide function whether or not the mouse entered the window
    this.$controls.isEntered = false;

    this.$delete = $("img.mp-option-delete");
    this.$update = $("img.mp-option-modify");
    this.$share = $("img.mp-option-share");

    this.$logout = $(".mp-option-logout");
    this.$center = $(".mp-option-center");

};

UIControls.prototype = {
    
    init : function(){
	this.placeCenterControl();
	
	height = main.getUI().getPanel().getFooterHeight();
	this.$logout.height(height);
    },
    placeCenterControl : function(){
	//reposition
	this.$center.show();
	position = $("#mp-map").position();

	position.top += $("#mp-header").height() * 2.25;
	position.left += $("#mp-header").height() * 0.35;
	this.$center.css({
	    'top' : position.top,
	    'left' : position.left
	    })
	    .hide();
    },
    
    /*
      @author: Frederik Claus
      @summary: displays modify control under a photo
      @param $el: the photo element under which controls are placed
    */
    showPhotoControls : function($el){
	center = $el.offset();
	tools = main.getUI().getTools();
	center.left += tools.getRealWidth($el)/2;
	center.top += tools.getRealHeight($el);

	// clear any present timeout, as it will hide the controls while the mousepointer never left
	if(this.hideControlsTimeoutId){
	    window.clearTimeout(this.hideControlsTimeoutId);
	    this.hideControlsTimeoutId = null;
	}
	this.showControls(center);
	this.setModifyPhoto(true);

    },
    
    /*
      @author: Frederik Claus
      @summary: controls are instantiated once and are used for albums, places and photos
      @param center: the bottom center of the element where the controls should be displayed
    */

    showControls : function(center){
	// calculate the offset
	tools = main.getUI().getTools();
	// center the controls below the center
	center.left  -= tools.getRealWidth(this.$controls)/2;

	// offset had a weird problem where it was pushing the controls down with every 2 consecutive offset calls
	this.$controls
	    .css({
		top: center.top,
		left: center.left
	    })
	    .show();

	// change factor depending on the page (-> number of controls in control-box)
	if (main.getUIState().isDashboard()) {
	    factor = 0.31;
	}
	else {
	    factor = 0.45;
	}
	// don't resize the icons all the time to save performance
	if (!this.$controls.isScaled){
	    this.$controls
		.find(".mp-controls-options")
		.height(this.$controls.height() * 0.8)
		.width(this.$controls.width() * factor);
	}
	
    },
    
    setModifyAlbum : function(active){
	this.isModifyAlbum = active;
	this.isModifyPlace = !active;
	this.isModifyPhoto = !active;
    },

    setModifyPlace : function(active){
	this.isModifyPlace = active;
	this.isModifyAlbum = !active;
	this.isModifyPhoto = !active;
    },
    
    setModifyPhoto : function(active){
	this.isModifyPhoto = active;
	this.isModifyPlace = !active;
	this.isModifyAlbum = !active;
    },

    /*
      @author: Frederik Claus
      @summary: hides the modfiy controls
      @param timeout: boolean, if the controls should be hidden after a predefined timout, when the controls are not entered
    */
    hideControls : function(timeout){
	var instance = this;
	hide = function(){
	    if(instance.$controls.isEntered){
		return;
	    }
	    instance.$controls.hide();
	};

	if(timeout){
	    this.hideControlsTimeoutId = window.setTimeout(hide,1000);
	}
	else{
	    this.$controls.hide();
	}
    },
    
    bindInsertPhotoListener : function(){

	this.$insert = $(".mp-option-add");
	//commit in iframe because of img upload
	this.$insert
	    .remove("click.PhotoMap")
	    .bind("click.PhotoMap",function(event){
	    place = main.getUIState().getCurrentPlace();
	    // reset load function 
	    main.getUI().getInput().getUpload("/insert-photo?place="+place.id,function(){return;});
	});
    },
    shareBindListener : function(){
	var instance = this;
	this.$share
	    .unbind("click")
	    .bind("click",function(event){
		state = main.getUIState();
		tools = main.getUI().getTools();
		controls = main.getUI().getControls();
		
		if ( state.getAlbumShareURL() && state.getAlbumShareURL().id == state.getCurrentAlbum().id ){
		    tools.openShareURL();
		}
		else {
		    url = "/get-album-share";
		    id = state.getCurrentAlbum().id;
		    main.getClientServer().getShareLink(url,id);
		}
	});
    },
    copyListener : function(){
	// copy to clipboard with jquery (zclip) using ZeroClipboard (javascript and flash)
	$("#mp-copy-button").zclip('remove').zclip({
	    path: 'static/js/zeroclipboard/zeroclipboard.swf',
	    copy: $("#mp-share-link").val(),
	    /*afterCopy: function(){
		$(".mp-overlay-trigger").overlay().close();
	    },*/
	});
    },
    
    bindListener : function(){
    // problem: when new markers are added the listeners get somehow get bound again 
    // so that the same listener lies on the same control multiple times
    // temporary solution: unbind all listeners first then bind them
	var instance = this;
	var state = main.getUIState();
	var information = main.getUI().getInformation();
	var tools = main.getUI().getTools();
	var input = main.getUI().getInput();
	
	this.$delete
	    .unbind("click")
	    .bind("click",function(event){
		// hide current place's markers and clean photos from gallery
		photo = state.getCurrentPhoto();
		place = state.getCurrentPlace();
		album = state.getCurrentAlbum();
		var url,data;
		
		// delete current photo
		if (instance.isModifyPhoto) {
		    if(confirm("Do you really want to delete photo " + photo.name)){
			url = "/delete-photo",
			data = {"id":photo.id};
			//deletes photo from gallery and moves or hides slider
			tools.deletePhoto(photo);
		    }
		    else 
			return;
		}
    
		// delete current place
		else if(instance.isModifyPlace){
		    if(confirm("Do you really want to delete place " + place.name)){
			url = "/delete-place";
			data = {"id":place.id};
			state.removePlace(place);
			information.hidePlaceTitle();
			place._delete();
		    }
		    else
			return;
		}
    
		// delete current album
		else if(instance.isModifyAlbum){
		    if(confirm("Do you really want to delete Album " + album.name)){
			url = "/delete-album";
			data = {"id":album.id};
			album._delete();
		    }
		    else
			return;
		}
		else{
		    alert("I don't know what to delete. Did you set one of setModify{Album,Place,Photo}?");
		    return;
		}
		
		// call to delete marker or photo in backend
		tools.deleteObject(url,data);
	});

	this.$update.unbind("click").bind("click",function(event){
	    var place = state.getCurrentPlace();
	    var photo = state.getCurrentPhoto();
	    var album = state.getCurrentAlbum();
	    
	    // edit current photo
	    if (instance.isModifyPhoto) {

		input
		    .onLoad(function(){
			//prefill with values from selected picture
			$("input[name=id]").val(photo.id);
			$("input[name=order]").val(photo.order);
			var $name = $("input[name=title]").val(photo.name);
			var $desc = $("textarea[name=description]").val(photo.desc);

			input.onForm(function(){
			    //reflect changes locally
			    photo.name = $name.val();
			    photo.desc = $desc.val();
			});
		    })
		    .get("/update-photo");
	    }

	    //edit current place
	    else if (instance.isModifyPlace){
		//prefill with name and update on submit

		input
		    .onLoad(function(){
			$("input[name=id]").val(place.id);
			var $name = $("input[name=title]").val(place.name);
			var $desc = $("textarea[name=description]").val(place.desc);

			input.onForm(function(){
			    //reflect changes locally
			    place.name = $name.val();
			    place.desc = $desc.val();
			    main.getUI().getInformation().updatePlace(place);
			});
		    })
		    .get("/update-place");
	    }
	    
	    //edit current album
	    else if (instance.isModifyAlbum){
		//prefill with name and update on submit

		input
		    .onLoad(function(){
			$("input[name=id]").val(album.id);
			var $name = $("input[name=title]").val(album.name);
			var $desc = $("textarea[name=description]").val(album.desc);

			input.onForm(function(){
			    //reflect changes locally
			    album.name = $name.val();
			    album.desc = $desc.val();
			});
		    })
		    .get("/update-album");
	    }
	});
	
	this.$controls
	    .bind("mouseleave",function(){
		instance.$controls.hide();
		instance.$controls.isEntered = false;
	    })
	    .bind("mouseenter",function(){
		instance.$controls.isEntered = true;
	    });
	
	this.$center.bind("click.MapPhotoAlbum",function(event){
	    var place = state.getCurrentPlace();
	    if (place){
		place.center();
	    }
	});
    },
    markerControlListener : function(object){
	state = main.getUIState();
	controls = main.getUI().getControls();
	
	if (object == "album") {
	    objects = state.getAlbums();
	    mouseoverControls = function(album){
		controls.setModifyAlbum(true);
		state.setCurrentAlbum(album);
	    };
	    
	}
	else if (object == "place") {
	    objects = state.getPlaces();
	    mouseoverControls = function(place){
		controls.setModifyPlace(true);
		state.setCurrentPlace(place);
	    };
	}
	
	objects.forEach(function(object,index,objects){
	    google.maps.event.addListener(object.marker.MapMarker, "mouseover", function(event){
		// gets the relative pixel position
		projection = main.getMap().getOverlay().getProjection();
		pixel = projection.fromLatLngToContainerPixel(object.marker.getPosition());
		// add the header height to the position
		pixel.y += main.getUI().getPanel().getHeight();
		// add the height of the marker
		markerSize = object.marker.getSize();
		pixel.y += markerSize.height;
		// add the width of the marker
		pixel.x += markerSize.width/2;
	    
		mouseoverControls(object);
		controls.showControls({top:pixel.y,left:pixel.x});
	    });
	
	    google.maps.event.addListener(object.marker.MapMarker, "mouseout", function(){
		controls.hideControls(true);
	    });
	});
    },
    handleGalleryDrop : function(event){
	event.stopPropagation();
	event.preventDefault();
	
	state = main.getUIState();
	input = main.getUI().getInput();
	place = state.getCurrentLoadedPlace();
	files = event.dataTransfer.files;
	checked = main.getUI().getTools().checkFiles(files);
	
	// check for file api support of the browser
	if (window.File && window.FileReader && window.FileList && window.Blob) {
	    
	    if ( checked.success ){
		// handler for gallery drop
		state.setFileToUpload(files[0]);
		hideInput = function(){$("input[type='file'],label[name='file-upload']").remove();};
		input.getUpload("/insert-photo?place=" + place.id,hideInput);
	    }
	    else {
		alert(checked.error);
		return;
	    }
	}
	else {
	  alert('The File APIs (DragnDrop) are not fully supported in this browser.');
	  return false;
	}
    },
    handleFileInput : function(event){
	event.stopPropagation();
	event.preventDefault();
	
	state = main.getUIState();
	place = state.getCurrentLoadedPlace();
	files = event.target.files;
	checked = main.getUI().getTools().checkFiles(files);
	
	if ( checked.success ){
	    state.setFileToUpload(files[0]);
	    return;
	}
	else {
	    $("input[name='file']").val(null);
	    alert(checked.error);
	    return;
	}
    },

};
