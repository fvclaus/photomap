UIState = function(){
    this.currentPhotoIndex = null;
    this.currentPhoto = null;
    this.currentPlace = null;
    this.currentAlbum = null;
    this.photos = new Array();
    this.places = new Array();
    this.albums = new Array();
    this.slideshow = false;	
    this.slideshowLoaded = false;
    this.albumLoading = false;
    this.fontSize = null;
    this.fullscreen = null;
    this.interactive = false;
};

UIState.prototype = {
    
    setModeInteractive : function(mode,page){
	this.interactive = mode;
	this.page = page;
    },
    isInteractive : function(){
	return this.interactive;
    },
    isDashboard : function(){
	// if albumview -> false
	return this.page == "dashboard";
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
    setCurrentLoadedPlace : function(place){
	this.currentLoadedPlace = place;
    },
    getCurrentPlace : function(){
	return this.currentPlace;
    },
    getPlaces : function(){
	return this.places;
    },
    setPlaces : function(places){
	this.places = places;
    },
    addPlace : function(place){
	this.places.push(place);
    },
    removePlace : function(place){
	this.places = this.places.filter(function(element,index){
	    return element !== place;
	});
    },
    setAlbums : function(albums){
	this.albums = albums;
    },
    getAlbums : function(){
	return this.albums;
    },
    addAlbum : function(album){
	this.albums.push(album);
    },
    removeAlbum : function(album){
	this.albums = this.albums.filter(function(element,index){
	    return element !== album;
	});
    },
    getCurrentLoadedPlace : function(){
	return this.currentLoadedPlace;
    },
    setCurrentAlbum : function(album){
	this.currentAlbum = album;
    },
    getCurrentAlbum : function(){
	return this.currentAlbum;
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
    // not used right now, but maybe worth being used!
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
    setGalleryLoaded : function(bool){
	this.galleryLoaded = bool;
    },
    isGalleryLoaded : function(){
	return this.galleryLoaded;
    },
    setAlbumShareURL: function(url){
	this.currentAlbumShare = url;
    },
    getAlbumShareURL: function(){
	return this.currentAlbumShare;
    },
};
