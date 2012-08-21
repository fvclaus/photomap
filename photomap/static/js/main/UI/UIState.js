UIState = function(){
    this.currentPhotoIndex = null;
    this.currentPhoto = null;
    this.photos = null;
    this.slideshow = false;	
    this.slideshowLoaded = false;
    this.albumLoading = false;
    this.fontSize = null;
    this.fullscreen = null;
    this.interactive = false;
};

UIState.prototype = {
    
    setModeInteractive : function(mode){
	this.interactive = true;
	if (mode == "dashboard"){
	    this.dashboard = true;
	}
	else {
	    this.dashboard = false;
	}
    },
    setModeNonInteractive : function(){
	this.interactive = false;
    },
    isInteractive : function(){
	return this.interactive;
    },
    isDashboard : function(){
	return this.dashboard;
    },
    setCurrentPhotoIndex : function(index){
	this.current = index;
    },

    getCurrentPhotoIndex : function(){
	return this.current;
    },

    setCurrentPhoto : function(photo){
	this.currentPhoto = photo;
    },
    
    getCurrentPhoto : function(){
	return this.currentPhoto;
    },

    setPhotos : function(photos){
	this.photos = photos;
    },
    getPhotos : function(){
	return this.photos;
    },
    setCurrentPlace : function(place){
	this.currentPlace = place;
    },
    getCurrentPlace : function(){
	return this.currentPlace;
    },
    setSlideshow : function(slideshow){
	this.slideshow = slideshow;
    },
    isSlideshow : function(){
	return this.slideshow;
    },
    setSlideshowLoaded : function(bool){
	this.slideshowLoaded = bool;
    },
    isSlideshowLoaded : function(bool){
	return this.slideshowLoaded;
    },
    setAlbumLoading: function(bool) {
	this.albumLoaded = bool;
    },
    isAlbumLoading : function(bool){
	return this.albumLoaded;
    },

    setFontSize : function(size){
	this.fontSize = size;
    },
    getFontSize: function(){
	return this.fontSize;
    },
    setFullscreen : function(bool){
	this.fullscreen = bool;
    },
    isFullscreen : function(bool){
	return this.fullscreen;
    },
};
