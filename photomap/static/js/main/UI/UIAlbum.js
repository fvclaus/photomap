/*
 * @author Marc Roemer
 * @class UIAlbum is a facade for UIGallery, UISlideshow, UIFullscreen and UIState
 * @requires UIAlbum, UIGallery, UIFullscreen, UIState
 */
UIAlbum = function() {
    
    this.gallery = new UIGallery(this);
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

	getGallery : function(){
		return this.gallery;
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
	/*
	 * @private
	 */
	hideLoading : function(){
		this.$loading.hide();
	},
	/*
	 * @private
	 */
	_showLoading : function(){
		this.$loading.show();
	},

		
	hide : function() {
		this.slideshow.closeSlideshow();
		this.album.getEl().empty();
		this.album.getEl().removeData('jsp');
	},

	disable : function(){
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

