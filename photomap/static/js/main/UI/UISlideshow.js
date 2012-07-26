
UISlideshow = function(gallery){
    this.gallery = gallery; 
    
    this.$slideshow = $('#mp-slideshow').hide();
    this.$next = this.$slideshow.find('img.mp-album-nav-next');
    this.$prev = this.$slideshow.find('img.mp-album-nav-prev');
    this.$close = this.$slideshow.find('img.mp-slideshow-close');
    this.$image = this.$slideshow.find("div.mp-album-image > img[class!='mp-album-zoom']");
    this.$loading = this.$slideshow.find('img.mp-image-loading-small');
    this.$zoom = this.$slideshow.find("img.mp-album-zoom");
    this.$wrapper = this.$slideshow.find("div.mp-album-image");

    this.bindListener();
    
};

UISlideshow.prototype = {

    init : function(){
	this.position();
    },
    scale : function(albumWidth){
	this.$slideshow
	    .show()
	    .width(albumWidth-parseInt(this.$slideshow.css("padding-left")))
	    .hide();
    },
    
    bindListener : function(){
	var instance = this;
	//bind slideshow button listener
	this.$close.bind('click.Gallery', function() {
	    if ($(this).hasClass("disabled")){
		return;
	    }
	    instance.closeSlideshow();
	});
	
	this.$next.bind('click.Gallery', function() {
	    if ($(this).hasClass("disabled")){
		return;
	    }
	    instance._navigateSlider( instance, 'right' );
	});
	
	this.$prev.bind('click.Gallery', function() {
	    if ($(this).hasClass("disabled")){
		return;
	    }
	    instance._navigateSlider( instance, 'left' );
	});
	
	this.$zoom
	    .bind("mouseover.Gallery",function(){
		if (main.getUIState().isSlideshowLoaded()){
		    $(this)
			.show()
			.css("opacity",".7");
		}
	    })
	    .bind("click.Gallery",function(){
		$(this).hide();
		instance.gallery.zoom();
	    })
	    .bind("mouseleave.Gallery",function(){
		$(this).css("opacity",".4");
	    });
    },

    position : function(){
	var position = main.getUI().getAlbum().getDimensions();
	// write height and width in overlay image wrapper and overlay
	// css only sizing and pos failed for some reason
	
	this.$slideshow
	    .css("left",position.left)
	    .css("top",position.top)
	    .width(position.width)
	    .height(position.height)
	    .show();
	this.$wrapper
	    .width(this.$slideshow.width() -(this.$next.width() + this.$prev.width()))
	    .height(this.$slideshow.height())
	    .css("left",this.$prev.width());
	this.$slideshow.hide();
    },

    closeSlideshow : function(){
	if (!main.getUIState().isSlideshow())
	    return;
	    
	$(".mp-slideshow").hide();
	$(".mp-album-wrapper").show();
	
	main.getUIState().setSlideshow(false);
	main.getUIState().setSlideshowLoaded(false);
	this.$slideshow.fadeOut("slow");

	main.getUIState().setCurrentPhotoIndex(null);
	main.getUIState().setCurrentPhoto(null);

	information = main.getUI().getInformation();
	information.setInfo(main.getUIState().getCurrentPlace());
	information.hideImageNumber();

    },

    showLoading : function(){
	this.$slideshow.show();
	this.$loading.show();
	this.$next.hide();
	this.$prev.hide();
	this.$close.hide();
	this.$image.hide();
    },

    hideLoading : function(){
	this.$slideshow.hide();
	this.$next.show();
	this.$prev.show();
	this.$close.show();
    },

    _startSlider: function() {
	var instance = this;
	
	$(".mp-album-wrapper").hide();
	$(".mp-slideshow").show();

	//disable UI interaction
	this.gallery.disableUI();
	main.getUIState().setSlideshow(true);
	this.$loading.show();

	var once = false;
	var updateImage = function(){
	    if (!once){
		once = true
		$('<img/>').load(function() {

		    if (main.getUIState().getCurrentPhoto()) {
			main.getUIState().getCurrentPhoto().showBorder(true);
		    }
		    instance.$image.load(function(){
			//center in the middle
			instance.$image.show();
			instance.$wrapper
			    .css("padding-top",
				 (instance.$slideshow.height() - instance.$image.height())/2);    
			instance.$image.hide();

			instance.$image.fadeIn("slow",function(){
			    
			    instance.gallery.enableUI();
			});

			instance.$loading.hide();
			main.getUIState().setSlideshowLoaded(true);


		    });
	    	    instance.$image.attr( 'src', main.getUIState().getCurrentPhoto().source );
	    	    instance._bindFullscreenListener();
		    instance.gallery._updateText();
		}).attr( 'src', main.getUIState().getCurrentPhoto().source );
	    }
	    else{
		return;
	    }
	};
	if (this.$slideshow.is(":hidden")){
	    this.$slideshow.fadeIn("slow",updateImage);
	    this.$image.hide();
	}
	else{
	    this.$image.fadeOut("slow",updateImage);
	}
	this.$loading.show();
	main.getUI().getInformation().setInfo(main.getUIState().getCurrentPhoto());
    },
    _navigateSlider					: function( instance, dir ) {
	//navigate to next photo or close if no photos left
	state = main.getUIState();
	currentPhotoIndex = state.getCurrentPhotoIndex();
	currentPhoto = state.getCurrentPhoto();
	photos = state.getPhotos();
	
	
	
	if( dir === 'right' ) {
	    if( currentPhotoIndex + 1 < photos.length )
		state.setCurrentPhotoIndex(++currentPhotoIndex);
	    else if (photos.length > 0){
		state.setCurrentPhotoIndex(0);
	    }
	    else {
		state.setCurrentPhotoIndex(0);
		state.setCurrentPhoto(null);
		this.closeSlideshow();
		return;
	    }
	}
	else if( dir === 'left' ) {
	    if( currentPhotoIndex - 1 >= 0 )
		state.setCurrentPhotoIndex(--currentPhotoIndex);
	    else if (photos.length > 0)
		state.setCurrentIndex(photos.length - 1);
	    else {
		state.setCurrentPhotoIndex(0);
		state.setCurrentPhoto(null);
		this.closeSlideshow();
		return;
	    }
	}
	
	state.setCurrentPhoto(photos[state.getCurrentPhotoIndex()]);
	this._startSlider();
    },

    disableControls : function(){
	this.$next.addClass("disabled");
	this.$prev.addClass("disabled");
	this.$close.addClass("disabled");	
    },
    enableControls : function(){
	this.$next.removeClass("disabled");
	this.$prev.removeClass("disabled");
	this.$close.removeClass("disabled");	
    },

    _bindFullscreenListener : function(){
	//problem: every time the slider is started the events get bound and get fired several times
	//unbind all events first, then bind a new one
	var instance = this;
	instance.$image
	    .unbind(".GalleryZoom")
	    .bind("mouseover.GalleryZoom",function(){
		if (main.getUIState().isSlideshowLoaded()){
		    var position = { 
			top : parseInt(instance.$wrapper.css("padding-top")),
			left : instance.$image.position().left
		    };
		    instance.$zoom
			.css("left",position.left + instance.$image.width()/2 - instance.$zoom.width()/2)
			.css("top",position.top + instance.$image.height()/2 - instance.$zoom.height()/2)
			.show();
		}
	    })
	    .bind("mouseleave.GalleryZoom",function(){
		instance.$zoom.hide();
	    });
    },

};
