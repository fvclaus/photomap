/*
 * @author Frederik Claus
 * @class UISlideshow displays one picture in the album
 */
UISlideshow = function(album){
	this.album = album; 

	this.$slideshow = $('#mp-slideshow').hide();
	this.$next = this.$slideshow.find('img.mp-album-nav-next');
	this.$prev = this.$slideshow.find('img.mp-album-nav-prev');
	this.$close = this.$slideshow.find('img.mp-slideshow-close');
	this.$image = this.$slideshow.find("div.mp-album-image > img[class!='mp-album-zoom']");
	this.$loading = this.$slideshow.find('img.mp-image-loading-small');
	this.$zoom = this.$slideshow.find("img.mp-album-zoom");
	this.$wrapper = this.$slideshow.find("div.mp-album-image");
	this.$background = $(".mp-slideshow-background").hide();

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
		var position = main.getUI().getGallery().getDimensions();
		// write height and width in overlay image wrapper and overlay
		this.$slideshow
				.css("left",position.left)
				.css("top",position.top)
				.width(position.width)
				.height(position.height)
				.show();
		this.$background
				.css("left",position.left)
				.css("top",position.top)
				.width(position.width)
				.height(position.height)
				.show()
		this.$wrapper
				.width(this.$slideshow.width() -(this.$next.width() + this.$prev.width()))
				.height(this.$slideshow.height())
				.css("left",this.$prev.width());
		this.$slideshow.hide();
		this.$background.hide();
	},

	closeSlideshow : function(){
		state = main.getUIState();
		information = main.getUI().getInformation();
		
		if (!main.getUIState().isSlideshow())
				return;
				
		$(".mp-slideshow").hide();
		$(".mp-slideshow-background").hide();
		
		state.setSlideshow(false);
		state.setSlideshowLoaded(false);
		this.$slideshow.fadeOut("slow");

		state.setCurrentPhotoIndex(null);
		state.setCurrentPhoto(null);

		information.hidePhotoTitle();
		information.hideDescription();
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
		var state = main.getUIState();
		var information = main.getUI().getInformation();
		var cursor = main.getUI().getCursor();
		
		$(".mp-slideshow-background").show();
		$(".mp-slideshow").show();

		//disable UI interaction
		this.album.disable();
		state.setSlideshow(true);

		var once = false;
		var updateImage = function(){
			if (!once){
				once = true
				$('<img/>').load(function() {
					if (state.getCurrentPhoto()) {
						state.getCurrentPhoto().showBorder(true);
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

						state.setSlideshowLoaded(true);


					});
					instance.$image.attr( 'src', state.getCurrentPhoto().source );
					instance._bindFullscreenListener();
					instance.gallery._updateText();
				}).attr( 'src', state.getCurrentPhoto().source );
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
		this.album.showLoading();
		
		// sets Photo title in album title bar and set+shows Photo description
		information.updatePhoto();
		// set cursor for fullscreen control
		cursor.setCursor($(".mp-album-zoom"),cursor.styles.pointer)
	},
		
	_navigateSlider : function( instance, dir ) {
		// navigate to next photo or close if no photos left
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
					state.setCurrentPhotoIndex(photos.length - 1);
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
