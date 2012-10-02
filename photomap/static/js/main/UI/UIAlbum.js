UIAlbum = function (gallery) {

    this.gallery = gallery;
    
    this.$album	= $('#mp-album-wrapper');
    this.albumPadding = this.$album.css("padding-left");
    this.albumWidth = this.$album.width();
    
    this.visible = false;

    this.$elements = null;

};

UIAlbum.prototype =  {

    searchImages : function(){
	this.$elements = this.$album.find('div.mp-gallery > img').not(".mp-option-add").not(".mp-controls-options");
    },
    getEl : function(){
	return this.$album;
    },
    getDimensions : function(){
	var position =  this.$album.position();
	position.width = this.$album.width();
	position.height = this.$album.height();
	console.log("width = " + position.width + " height = " + position.height);
	return position;
    },
    getScrollPane : function(){
	return this.$album.data('jsp');
    },
    _setVisibility : function(visible){
	this.visible = visible;
    },
    isVisible : function(){
	return this.visible;
    },
    show : function( photos ) {
	var instance = this;
	var state = main.getUIState();
	var controls = main.getUI().getControls();
	
	// show gallery in case it's hidden
	$("#mp-album").show();
	
	// visibility to true for exposé
	this._setVisibility(true);
	
	state.setPhotos(photos);
	state.setAlbumLoading(true);
	
	var tmplPhotosData = new Array();
	var loaded = 0;
	this.gallery.disableUI();
	this.gallery.showLoading();
	
	// bugfix for empty places (to show empty "add"-tile)
	if (state.isInteractive() && photos.length == 0){
	    instance.$album.append(
		$.jqote( '#galleryTmpl', {} )
	    );
	    
	    controls.bindInsertPhotoListener();
	    controls.bindListener();
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
		    // if user is guest -> remove add-photo-button
		    if ( !state.isInteractive() ) {
			$("img.mp-option-add").remove();
		    }
		    //search all anchors
		    instance.searchImages();
		    // make wrapping anchors sortable
		    // write height and width in album image wrapper
		    instance.$album
			.find("div.mp-gallery")
			.width(instance.$album.width())
			.height(instance.$album.height())
		    
		    /* ------------------
		     * disabled for now, enable again when drag'n'drop file-upload is working smoothly
		     * 
		    if ( state.isInteractive() ){
			// Drag n Drop for Photos if user is admin
			instance.$album
			    .find("div.mp-gallery")
			    .sortable({
				items : "img.sortable",
				update : function(event,ui){
				    instance.searchImages();
				    var jsonPhotos = new Array();
				    
				    state.getPhotos().forEach(function(photo,index,photos){
					// get html tag for current photo
					currentPhoto = $('img[src="' + photo.source + '"]');
					// find index of current photo in mp-gallery
					photo.order = instance.$elements.index(currentPhoto);
					// make a deep copy
					jsonPhoto = $.extend(true,{},photo);
					jsonPhotos.push(jsonPhoto);
					// when all photos with new order are in jsonPhotos, save the order
					if (index == photos.length-1){
					    main.getClientServer().savePhotoOrder(jsonPhotos);
					}
				    });
				}
			    });
		    }
		     * 
		     */
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
		    
		    //instance.gallery.getSlideshow()
			//.scale(instance.$album.width());

		    instance.bindListener();

		    controls.bindInsertPhotoListener();
		    
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
	var state = main.getUIState();
	var cursor = main.getUI().getCursor();
	var controls = main.getUI().getControls();
	
	//bind events on anchors
	instance.$elements
	.unbind('.Gallery')
	.bind( 'mouseenter.Gallery', function( event ) {
	    var $el = $(this);
	    $el
		.addClass('current')
		.removeClass("visited")
		.siblings('img').removeClass('current');
	    
	    photo = (state.getPhotos())[$el.index()];
	    state.setCurrentPhotoIndex($el.index());
	    state.setCurrentPhoto(photo);
	    
	    if ( state.isInteractive() ){
		controls.setModifyPhoto(true);
		controls.showPhotoControls($el,photo);
	    }
	    cursor.setCursor($el,cursor.styles.pointer); 

	}).bind( 'mouseleave.Gallery', function( event ) {
	    var $el = $(this);
	    //add visited border if necessary
	    (state.getPhotos())[$el.index()].checkBorder();
	    $el.removeClass('current');
	    
	    if (state.isInteractive() ){
		controls.hideControls(true);
	    }

	}).bind( 'mousedown.Gallery', function(event){
	    var $el = $(this);
	    // set Cursor for DragnDrop on images (grabber)
	    cursor.setCursor($el,cursor.styles.grab); 
	    
	}).bind( 'click.Gallery', function( event ) {
	    var $el = $(this);
	    
	    $el.removeClass('current');
	    state.setCurrentPhotoIndex($el.index());
	    state.setCurrentPhoto((state.getPhotos())[$el.index()]);

	    main.getUI().getControls().hideControls(false);
	    
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
