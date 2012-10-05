UIAlbum = function() {
    
    this.album = new UIAlbum(this);
    this.slideshow = new UISlideshow(this);
    this.fullscreen = new UIFullscreen(this);
    this.state = new UIState(this);
    this.$loading = $("#mp-image-loading-small");
    
};

UIAlbum.prototype = {
    
    init : function(){
	this.slideshow.init();
    },
    getSlideshow : function(){
	return this.slideshow;
    },

    getFullscreen : function(){
	return this.fullscreen;
    },

    getAlbum : function(){
	return this.album;
    },

    getState : function(){
	return this.state;
    },

    navigateSlider : function(instance,dir){
	return this.slideshow._navigateSlider(instance,dir);
    },
    startSlider : function(){
	return this.slideshow._startSlider();
    },

    zoom : function(){
	return this.fullscreen.zoom();
    },

    hideLoading : function(){
			this.$loading.hide();
    },
    
    showLoading : function(){
			this.$loading.show();
    },

    
    hide : function() {
	this.slideshow.closeSlideshow();
	this.album.getEl().empty();
	this.album.getEl().removeData('jsp');
    },

	disableUI : function(){
		this.slideshow.disableControls();
		var places = main.getUIState().getPlaces();
		places.forEach(function(place){
				place.showDisabledIcon();
		});
		this._showLoading();
		this.loading = true;
	},

	enableUI : function(){
		this.slideshow.enableControls();
		var places = main.getUIState().getPlaces();
		places.forEach(function(place){
			place.checkIconStatus();
		});
		this._hideLoading();
		this.loading = false;
	},
    
	_updateText : function(){
	if (this.currentPhoto){
	    information = main.getUI().getInformation();
	    information.showImageNumber();
	    currentIndex = this.photos.indexOf(this.currentPhoto) + 1;
	    information.setImageNumber(currentIndex+"/"+this.photos.length);
	}
    },
};

