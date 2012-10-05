UIInformation = function(){
	
    this.$wrapper = $("#mp-description");
    this.$bottomPanel = $(".mp-bottom-panel");
    this.$album = $("#mp-album");
    this.$close = $(".mp-description-overlay-close");
    this.$infoButton = $(".mp-option-information");
    this.$description = $(".mp-description-wrapper").jScrollPane();
    this.$imageNumber = this.$wrapper.find(".mp-image-number");
    
    this.visible = false;
    
    this.bindListener();
    
};

UIInformation.prototype = {
    
    init : function(){
	this.placeDescription();
    },
    _setVisibility : function(visible){
	this.visible = visible;
    },
    isVisible : function(){
	return this.visible;
    },
    updateAlbumTitle : function(){
			title = main.getUIState().getAlbum().name;
	$(".mp-page-title h1").text(title);
    },
    updatePlaceTitle : function(){
	title = main.getUIState().getCurrentPlace().name;
	$(".mp-place-title").text(title);
    },
    updatePhotoTitle : function(){
	title = main.getUIState().getCurrentPhoto().name;
	$(".mp-photo-title")
	    .show()
	    .find(".mp-option-information")
	    .text(title);
    },
    hidePhotoTitle : function(){
	$(".mp-photo-title").hide();
    },
    updatePlaceTitle : function(){
	if (main.getUIState().getCurrentPlace() == main.getUIState().getCurrentLoadedPlace()){
	    $(".mp-place-title").empty();
	}
	else{
	    return;
	}
    },
    placeDescription : function () {
	// resizing and repositioning description wrapper
	$map = $(".mp-map");
	mapOffset = $map.offset();
	topOffset = mapOffset.top + (0.5 * (0.25 * $map.height()));
	leftOffset = mapOffset.left + (0.65 * (0.125 * $map.width()));
	descriptionWidth = 0.375 * $map.width();
	descriptionHeight = 0.75 *$map.height();
	this.$wrapper
	    .width(descriptionWidth)
	    .height(descriptionHeight)
	    .offset({top: topOffset, left: leftOffset});
	    
	// reposition closing "button"
	imgHeight = this.$close.height();
	imgWidth = this.$close.width();
	closeButtonOffset = {
	    top: topOffset - (0.5 * imgHeight),
	    left: leftOffset + descriptionWidth - (0.5 * imgWidth)
	}
	this.$close.offset(closeButtonOffset);
	// hide description box for now
	this.$wrapper.hide();
    },
    _setDescription : function (desc) {
	api = this.$description.data('jsp');
	api.getContentPane()
	    .find("p")
	    .empty()
	    .html(desc);
	if (this.$wrapper.is(":hidden")){
	    this.$wrapper.show();
	    // trigger event to expose description
	    this._setVisibility(true);
	    mpEvents.trigger("body",mpEvents.toggleExpose);
	};
	api.reinitialise();
    },
    updatePlaceDescription : function(){
	info = main.getUIState().getCurrentLoadedPlace().desc;
	this._setDescription(info);
    },
    updatePhotoDescription : function(){
	info = main.getUIState().getCurrentPhoto().desc;
	this._setDescription(info);
    },
    updatePhoto : function(){
			this.updatePhotoDescription();
			this.updatePhotoTitle();
			this.updateImageNumber();
		},
    updateAlbumDescription : function(){
	info = main.getUIState().getCurrentAlbum().desc;
	this._setDescription(info);
    },
    closeDescription : function(){
	this.$wrapper.fadeOut(500);
	// trigger event to hide expose mask
	this._setVisibility(false);
	mpEvents.trigger("body",mpEvents.toggleExpose);
    },
    hideDescription : function(){
	this.$wrapper.hide();
	// trigger event to hide expose mask
	this._setVisibility(false);
	mpEvents.trigger("body",mpEvents.toggleExpose);
    },
    updatePlace : function(placeinfo){
	state = main.getUIState();
	if (state.getCurrentPlace() == state.getCurrentLoadedPlace()){
	    this.setPlaceTitle(placeinfo.name);
	    this.setPlaceDescription(placeinfo.desc);
	}
	else{
	    return;
	}
    },
    bindListener : function(){
	var instance = this;
	this.$close.bind('click',function(){
	    instance.closeDescription();
	});
	this.$infoButton.unbind('click').bind('click',function(){
	    $button = $(this);
	    if ($button.hasClass("mp-page-title")){
		instance.setAlbumDescription();
		instance.hideImageNumber();
	    }
	    if ($button.hasClass("mp-place-title")){
		instance.setPlaceDescription();
		instance.hideImageNumber();
	    }
	    if ($button.parent().hasClass("mp-photo-title")){
		instance.setPhotoDescription();
		instance.showImageNumber();
	    }
	});
    },
    hideImageNumber : function(){
	this.$imageNumber.hide();
	this.$imageNumber.next().css("margin-left",0);
    },
    showImageNumber : function(){
	this.$imageNumber.show();
	margin = - this.$imageNumber.width();
	this.$imageNumber.next().css("margin-left",margin);
    },
    updateImageNumber : function() {
			photos = main.getUIState().getPhotos();
			this.$imageNumber.text(" Bild " + state.getCurrentPhotoIndex() + 1 + "/" + photos.length);
    },
};
