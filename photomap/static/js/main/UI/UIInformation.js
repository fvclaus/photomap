UIInformation = function(){
	
    this.$wrapper = $("#mp-description");
    this.$bottomPanel = $(".mp-bottom-panel");
    this.$album = $("#mp-album");
    this.$close = $(".mp-description-overlay-close");
    this.$infoButton = $(".mp-option-information");
    this.$description = $(".mp-description-wrapper").jScrollPane();
    this.$imageNumber = this.$wrapper.find(".mp-image-number");
    
    this.bindListener();
    
};

UIInformation.prototype = {
    
    init : function(){
	this.placeDescription();
    },
    setAlbumTitle : function(title){
	$(".mp-page-title h1").text(title);
    },
    setPlaceTitle : function(){
	title = main.getUIState().getCurrentPlace().name;
	$(".mp-place-title").text(title);
    },
    setPhotoTitle : function(){
	title = main.getUIState().getCurrentPhoto().name;
	$(".mp-photo-title")
	    .show()
	    .find(".mp-option-information")
	    .text(title);
    },
    hidePhotoTitle : function(){
	$(".mp-photo-title").hide();
    },
    hidePlaceTitle : function(){
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
	};
	api.reinitialise();
    },
    setPlaceDescription : function(){
	info = main.getUIState().getCurrentLoadedPlace().desc;
	this._setDescription(info);
    },
    setPhotoDescription : function(){
	info = main.getUIState().getCurrentPhoto().desc;
	this._setDescription(info);
    },
    setAlbumDescription : function(){
	info = main.getUIState().getCurrentAlbum().desc;
	this._setDescription(info);
    },
    closeDescription : function(){
	this.$wrapper.fadeOut(500);
    },
    hideDescription : function(){
	this.$wrapper.hide();
    },
    updatePlace : function(placeinfo){
	if (main.getUIState().getCurrentPlace() == main.getUIState().getCurrentLoadedPlace()){
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
    setImageNumber : function(index,total) {
	this.$imageNumber.text(" Bild " + index + "/" + total);
    },
};
