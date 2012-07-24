UIAlbum = function (gallery) {

    this.gallery = gallery;

    //reserve  4px as buffer
    this.$album	= $('#mp-album-wrapper');
    this.$album.width(this.$album.width() - 4);
    this.albumPadding = this.$album.css("padding-left");
    this.albumWidth = this.$album.width();

    this.$elements = null;

};

UIAlbum.prototype =  {

    searchImages : function(){
	this.$elements = this.$album.find('div.mp-gallery > img').not(".mp-option-add").not(".mp-photo-controls");
    },

    getEl : function(){
	return this.$album;
    },
    
    getDimensions : function(){
	var position =  this.$album.position();
	position.width = this.$album.width();
	position.height = this.$album.height();
	return position;
    },

    show : function( photos ) {
	var instance = this;
	main.getUIState().setPhotos(photos);
	main.getUIState().setAlbumLoading(true);
	var tmplPhotosData = new Array();
	var loaded = 0;
	this.gallery.disableUI();
	this.gallery.showLoading();
	
	// bugfix for empty places (to show empty "add"-tile)
	if (photos.length == 0){
	    instance.$album.append(
		$.jqote( '#galleryTmpl', {} )
	    );
	    main.ui.controls.setPhotoControls();
	    main.ui.controls.plantAddControl();
	    main.ui.controls.bindListener();
	}

	
	for( var i = 0, len = photos.length; i < len; ++i ) {
	    tmplPhotosData.push( photos[i].thumb );
	    $('<img/>').load(function() {
		++loaded
		if( loaded === len ) {
		    main.getUIState().setAlbumLoading(false);
		    instance.gallery.hideLoading();
		    instance.gallery.enableUI();
		    // create wrapping anchors for images
		    instance.$album.append(
			$.jqote( '#galleryTmpl', {thumbAddress: tmplPhotosData} )
		    );
		    //search all anchors
		    instance.searchImages();
		    // make wrapping anchors sortable
		    // write height and width in album image wrapper
		    instance.$album
			.find("div.mp-gallery")
			.width(instance.$album.width())
			.height(instance.$album.height())
		    // Drag n Drop for Photos
		    instance.$album
			.find("div.mp-gallery")
			.sortable({
			    items : "img.sortable",
			    update : function(event,ui){
				instance.searchImages();
				var jsonPhotos = new Array();

				main.getUIState().getPhotos().forEach(function(photo,index,photos){
				    //find position of image el
				    photo.order = instance.$elements.index(photo.$anchorEl);
				    //make a deep copy
				    jsonPhoto = $.extend(true,{},photo);
				    delete jsonPhoto.$anchorEl;
				    jsonPhotos.push(jsonPhoto);
				    if (index == photos.length-1){
					main.getClientServer().savePhotos(jsonPhotos);
				    }
				});
			    }
			});
		    // create scrollpane 
		    instance.$album
			.css("padding-left",instance.albumPadding)
			.width(instance.albumWidth)
			.jScrollPane({
			    verticalDragMinHeight	: 40,
			    verticalDragMaxHeight	: 40,
			    animateScroll		: true	
			});
		    //hack to remove horizontal scrollbars which always show up
		    $(".jspHorizontalBar").remove();
		    
		    instance.gallery.getSlideshow()
			.scale(instance.$album.width());

		    instance.bindListener();
		    main.ui.controls.setPhotoControls();
		    main.ui.controls.plantAddControl();
		    main.ui.controls.bindListener();
		}
	    }).attr( 'src', photos[i].thumb );
	}
	if (main.getUIState().isAlbumLoading() && photos.length == 0){
	    main.getUIState().setAlbumLoading(false);
	    this.gallery.hideLoading();
	    this.gallery.enableUI();
	}
	
	

    },

    bindListener : function(){
	var instance = this;
	state = main.getUIState();
	//bind events on anchors
	instance.$elements.bind( 'mouseenter.Gallery', function( event ) {
	    var $el = $(this);
	    $el
		.addClass('current')
		.removeClass("visited")
		.siblings('img').removeClass('current');
	    
	    photo = (state.getPhotos())[$el.index()];
	    state.setCurrentPhotoIndex($el.index());
	    state.setCurrentPhoto(photo);
	    
	    main.ui.controls.showPhotoControls($el,photo);

	}).bind( 'mouseleave.Gallery', function( event ) {
	    var $el		= $(this);
	    //add visited border if necessary
	    (main.getUIState().getPhotos())[$el.index()].checkBorder();
	    $el.removeClass('current');
	    
	    //main.ui.controls.hidePhotoControls();

	}).bind( 'click.Gallery', function( event ) {
	    var $el					= $(this);
	    
	    $el.removeClass('current');
	    state.setCurrentPhotoIndex($el.index());
	    state.setCurrentPhoto((state.getPhotos())[$el.index()]);
	    
	    // starts little slideshow in gallery div
	    instance.gallery.startSlider();
	    return false;
	});
	//draw border on visited elements
	main.getUIState().getPhotos().forEach(function(photo){
	    photo.checkBorder();
	});
    },
    
};
