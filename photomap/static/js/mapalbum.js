/**
 * Photo Map
 *
 *
 * Copyright 2011, Frederik Claus
 * Original Code by Pedro Botelho 
 *   Multi-level Photo Map -> http://www.codrops.com/
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Date: Dec 2011
 */
Array.prototype.firstUndef = function(){
    index = -1;
    for (i = 0; i<= this.length;i++){
	if (this[i] == null){
	    return i;
	}
    }
    return -1;
};
$(function() {
    Map	= function() {		
	// google.maps.Map
	this.map			= null;
	// the DOM element
	this.$mapEl			= $('#map');
	this.$mapEl.data({
	    originalWidth	: this.$mapEl.width(),
	    originalHeight	: this.$mapEl.height()
	});
	// the map options
	this.mapOptions 	= {
	    mapTypeId					: google.maps.MapTypeId.ROADMAP,
	    mapTypeControl				: true,
	    mapTypeControlOptions		: {
		style		: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
		position	: google.maps.ControlPosition.TOP_LEFT
	    },
	    panControl					: true,
	    panControlOptions			: {
		position	: google.maps.ControlPosition.TOP_RIGHT
	    },
	    zoomControl					: true,
	    zoomControlOptions			: {
		style		: google.maps.ZoomControlStyle.SMALL,
		position	: google.maps.ControlPosition.TOP_RIGHT
	    },
	    streetViewControl			: true,
	    streetViewControlOptions	: {
		position	: google.maps.ControlPosition.TOP_RIGHT
	    }
	}
	//user is guest
	if (!$.data(Main,"cookie").isAdmin()){
	    this.mapOptions.styles = [
		{
		    featureType: "road",
		    elementType:"labels",
		    stylers: [
			{ visibilty: "simplified"}
		    ]
		},
		{
		    featureType : "poi",
		    elementType : "labels",
		    stylers : [
			{visibility:"simplified"}
		    ]
		},
		{
		    featureType : "road.highway",
		    stylers :[
			{visibility:"off"}
		    ]
		}
	    ];
	}
	// mode : fullscreen || normal
	this.mode			= 'normal';	
	this._create();		
    };
    Map.prototype = {
	// initialize the google.maps.Map instance.
	_create				: function() {
	    var instance 	= this;
	    this.map 		= new google.maps.Map( this.$mapEl[0], this.mapOptions );
	    this.places = new Array();
	    this.maptype = google.maps.MapTypeId.ROADMAP;
	    this.SATELLITE =  google.maps.MapTypeId.SATELLITE;
	    this.ROADMAP = google.maps.MapTypeId.ROADMAP;

	    if ($.data(Main,"cookie").isAdmin()){
		//create new place with description and select it 
		google.maps.event.addListener(this.map,"click",function(event){

		    var inputOverlay = $.data(Main,"inputOverlay");
		    var lat = event.latLng.lat();
		    var lng = event.latLng.lng();
		    // declare beforehand so accessible in both closures
		    var place;

		    inputOverlay.onAjax(function(data){
			if (!data){
			    alert ("could not get id for newly inserted place");
			}
			console.log("received id %d",data["place-id"]);
			place.id = data["place-id"]
		    });
		    
		    inputOverlay.onLoad(function(){
			$("input[name=place-lat]").val(lat);
			$("input[name=place-lng]").val(lng);

			inputOverlay.onForm(function(){
			    //get place name + description
			    var name = $("[name=place-name]").val();
			    var desc = $("[name=place-desc]").val();
			    //create new place and show marker
			    place = new Place({
				lat: lat,
				lng: lng,
				"name" : name,
				"desc" : desc
			    });
			    place.marker.show();
			    inputOverlay._close();
			    //redraws place
			    place.triggerClick();
			});
		    });

		    inputOverlay.get("/insert-place");
		});
	    }
	},
	getInstance			: function() {
	    return this.map;
	},
	// restricts maximum zoom level for fitbounds function :
	// taken from : http://boogleoogle.blogspot.com/2010/04/maximum-zoom-level-when-using-fitbounds.html
	_controlZoom		: function() {
	    var instance	= this;
	    zoomChangeListener =  google.maps.event.addListener( this.map, 'zoom_changed', function() {
		zoomChangeBoundsListener = google.maps.event.addListener( instance.map, 'bounds_changed', function(event) {
		    if (this.getZoom() > 15) // don't allow a zoom factor > 15
			this.setZoom(15);
		    google.maps.event.removeListener(zoomChangeBoundsListener);
		});
		// remove this event listener since we will want to be able to zoom in after the markers are displayed on the map.
		google.maps.event.removeListener(zoomChangeListener);
	    });
	},
	// takes an array of markers and resizes + pans the map so all places markers are visible
	// does not show/hide marker 
	fit : function( markersinfo ) {
	    var markersinfo 	= markersinfo || this.markersinfo;
	    this.markersinfo	= markersinfo;
	    this._controlZoom();
	    var LatLngList = new Array();

	    for( var i = 0, len = markersinfo.length; i < len; ++i ) {
		var minfo	= markersinfo[i];
		LatLngList.push( new google.maps.LatLng ( minfo.lat , minfo.lng ) );
	    }
	    // create a new viewpoint bound
	    var bounds = new google.maps.LatLngBounds ();

	    // go through each...
	    for ( var i = 0, LtLgLen = LatLngList.length; i < LtLgLen; ++i ) {
		// And increase the bounds to take this point
		bounds.extend( LatLngList[i] );
	    }
	    // fit these bounds to the map
	    this.map.fitBounds( bounds );
	}
    };
    // abstract marker either represents a place or photo
    Marker = function(data) {	
	this._create(data);
    };
	
    Marker.prototype = {
	_create				: function( data ) {
	    var map 			= $.data( Main, 'map' );
	    
	    // latitude and longitude
	    this.lat			= data.lat;
	    this.lng			= data.lng;
	    // title
	    this.title			= data.title;
	    // custom icons for the map markers
	    this.mapicon		= 'images/camera-roadmap.png';
	    
	    this.MapMarker 		= new google.maps.Marker({
		position	: new google.maps.LatLng ( this.lat , this.lng ),
		map			: map.getInstance(),
		icon		: this.mapicon,
		//place		: place,
		title		: this.title
	    });
	    // don't show for now
	    this.MapMarker.setMap(null);
	    
	},
	show	: function() {
	    var map 			= $.data( Main, 'map' );
	    this.MapMarker.setMap( map.getInstance() );
	},
	hide	: function() {
	    this.MapMarker.setMap( null );
	},
	set	: function( options ) {
	    if( typeof options.icon != 'undefined' )
		this.MapMarker.setIcon(options.icon);
	    if( typeof options.zindex != 'undefined' )
		this.MapMarker.setZIndex(options.zindex);
	}
    };
    // photo is stored by in a place object, encapsulation of an marker
    Photo = function(data,index) {
	this.thumb = data.thumb;
	this.source = data.source;
	this.name = data.name;
	this.desc = data.desc;
	this.id = data.id;
	this.order = data.order;
	this.visited = $.data(Main,"cookie").isVisitedPhoto(this.id);
    };
    
    Photo.prototype = {
	checkBorder : function(){
	    //need reselection because anchors change
	    this.$anchorEl = $("a[href="+this.thumb+"]").addClass("visited");
	},
	showBorder : function(bool){
	    this.visited = bool;
	    $.data(Main,"cookie").addPhoto(this.id);
	    this.checkBorder();
	}
    };
    // place stores severall pictures and is itself stored in the map
    Place = function(data) {
	this.name = data.name; // will be used for the Map Marker title (mouseover on the map)
	this.id = data.id;
	this.desc = data.desc;
	this.visited = $.data(Main,"cookie").isVisitedPlace(this.id);
	
	this.marker		= new Marker({
	    lat		: parseFloat(data.lat), 
	    lng		: parseFloat(data.lng),
	    title	: this.name
	});
	if (this.visited){
	     this.showVisitedIcon();
	}
	var instance = this;
	// click event for place (its marker)
	// in the eventcallback this will be the gmap
	// use instance as closurefunction to access the place object
	google.maps.event.addListener( this.marker.MapMarker, 'click', function() {
	    console.log("title %s",this.getTitle());
	    var map = $.data(Main,"map");
	    if (map.place){
		map.place.showVisitedIcon();
	    }
	    //close slideshow if open
	    $.data(Main,"gallery").closeSlideshow();
	    instance.setVisited(true);
	    // clear gallery photos + slider and map.place
	    instance._clear();
	    map.place = instance;
	    // set title in mp-options bar
	    var menu = $.data( Main, 'menu' );
	    menu.setInfo(instance);
	    menu.hideStatusInformation();
	    menu.showTitleControls();
	    instance._showGallery();
	    instance.marker.set({icon:"images/camera-current.png"});
	});
	this.photos = new Array();
	if (data.photos){
	    for( var i = 0, len = data.photos.length; i < len; ++i ) {
		this.photos.push( new Photo( data.photos[i],i ) );
	    }
	}
    };

    Place.prototype = {
	_delete : function(){
	    this._clear();
	    this.marker.hide();
	},
	triggerClick : function(){
	    var map = $.data(Main,"map");
	    google.maps.event.trigger(this.marker.MapMarker,"click");
	},
	setVisited : function(bool){
	    this.visited = bool;
	    $.data(Main, "cookie").addPlace(this.id);
	},
	showVisitedIcon : function(){
	    this.marker.set({icon : "images/camera-visited.png"});
	},
	isVisited : function(){
	    return this.isVisited();
	},
	center : function(){
	    var map = $.data(Main,"map").map;
	    map.setZoom(13);
	    map.panTo(this.marker.MapMarker.getPosition());
	    
	},
	_showGallery		: function() {
	    $.data(Main, 'gallery' ).show( this.photos );
	},
	_clear  : function(){
	    // hide galleryAlbum container if present
	    var gallery	= $.data( Main, 'gallery' );
	    gallery.hide();
	    // $("div.mp-album-outer").remove();
	}
    };
    MapPhotoAlbum = function() {
	// array of places
	this.places = new Array();
    };

    MapPhotoAlbum.prototype = {
	init				: function() {
	    var instance 	= this;
	    // make an AJAX call to get the places from the XML file, and display them on the Map
	    this._getPlaces( function() {
		instance._showPlaces();
	    });
	    var menu 		= $.data( Main, 'menu' );
	    var gallery = $.data(Main,"gallery");
	    var inputOverlay = $.data(Main,"inputOverlay");

	    // initialize events for the menu controls
	    //currently not used

	    menu.$deleteBtn.bind("click.MapPhotoAlbum",function(event){
		// hide current place's markers and clean photos from gallery
		var place = $.data(Main,"map").place;
		var url,data;
		
		if (gallery.isSlideshow()) {
		    if(confirm("Do you really want to delete photo "+gallery.currentPhoto.name)){
			url = "/delete-photo",
			data = {"photo-id":gallery.currentPhoto.id};
			//deletes photo from gallery and moves or hides slider
			gallery.deletePhoto(gallery.currentPhoto);
		    }
		    else 
			return;
		}

		else{
		    if(confirm("Do you really want to delete place "+place.name)){
			url = "/delete-place";
			data = {"place-id":place.id};
			place._delete();
			var menu = $.data(Main,"menu");
			menu.hideTitleControls();
			menu.setInfo();
		    }
		    else
			return;
		}
		//call to delete marker or photo in backend
		$.ajax({
		    type : "post",
		    dataType : "json",
		    "url" : url,
		    "data" : data,
		    success : function(data){
			if (data.error){
			    alert(data.error);
			}
		    },
		    error : function(err){
			alert(err.toString());
		    }
		});
	    });

	    menu.$modifyBtn.bind("click.MapPhotoAlbum",function(event){
		var place = $.data(Main,"map").place;
		//slider is activated edit current picture
		if (gallery.isSlideshow()) {

		    inputOverlay
			.onLoad(function(){
			    //prefill with values from selected picture
			    $("input[name=photo-id]").val(gallery.currentPhoto.id);
			    $("input[name=photo-order]").val(gallery.currentPhoto.order);
			    var $name = $("input[name=photo-name]").val(gallery.currentPhoto.name);
			    var $desc = $("textarea[name=photo-desc]").val(gallery.currentPhoto.desc);

			//reflect changes locally when form is valid and ready to be send
			    inputOverlay.onForm(function(){
				gallery.currentPhoto.name = $name.val();
				gallery.currentPhoto.desc = $desc.val();
				menu.setInfo({
				    name : $name.val(),
				    desc : $desc.val()
				});
			    })
			})
			.get("/update-photo");
		}

		//edit current place
		else {
		    //prefill with name and update on submit
		    inputOverlay
			.onLoad(function(){
			    $("input[name=place-id]").val(place.id);
			    var $name = $("input[name=place-name]").val(place.name);
			    var $desc = $("textarea[name=place-desc]").val(place.desc);

			    inputOverlay.onForm(function(){
				//reflect changes locally
				place.name = $name.val();
				place.desc = $desc.val();
				menu.setInfo(place);
			    })
			})
			.get("/update-place");
		}
	    });
	    //commit in iframe because of img upload
	    menu.$addBtn.bind("click.MapPhotoAlbum",function(event){
		var place = $.data( Main, 'map' ).place;
		// reset load function 
		inputOverlay.iFrame("/insert-photo?placeId="+place.id);
	    });
	    menu.$centerBtn.bind("click.MapPhotoAlbum",function(event){
		var place = $.data(Main,"map").place;
		if (place){
		    place.center();
		}
	    });
	    //save cookie state in db , currently not used
	    menu.$saveBtn.bind("click.MapPhotoAlbum",function(event){
		var cookie = $.data(Main,"cookie");
		//save slot name and save preference
		inputOverlay.onAjax(function(){
		    cookie.setSlot($("input[name=mp-history-slot]").val());
		});

		//has been used before
		if (cookie.slot){
		    //show disabled functionality
		}
		else{
		    inputOverlay
			.onLoad(function(){
			    //prefill with current value
			    $("input[name=mp-history-content]").val($.data(Main,"cookie").value);
			})
			.get("/insert-history");
		}
	    });
	    menu.$loadBtn.bind("click.MapPhotoAlbum",function(event){
		inputOverlay
		    .onAjax(function(data){
			cookie.setSlot(data.slot);
			cookie.reintialise(data.content);
		    })
		    .get("/get-history");
	    });
	},
	_getPlaces			: function( callback ) {
	    var instance = this;
	    // get the places and its info from the XML file
	    $.getJSON('album', function( data ) {
		// the album name
		instance.name = data.name;
		// the album description
		instance.desc = data.desc;

		$.each( data.places, function( key, placeinfo ) {
		    var place = new Place( placeinfo )
		    instance.places.push( place );
		});
		if( callback ) callback.call();
	    });
	    
	},
	_showPlaces			: function() {
	    var map 			= $.data( Main, 'map' ),
	    markersinfo		= [];
	    map.places = this.places;	    

	    map.places.forEach(function(place){
		console.dir(place.photos);
		copy = place.photos;
		noOrder = new Array();
		place.photos = new Array();
		copy.forEach(function(photo){
		    if (photo.order && parseInt(photo.order) != NaN){
			place.photos[photo.order] = photo;
		    }
		    else{
			noOrder.push(photo);
		    }
		});
		noOrder.forEach(function(photo){
		    nullIndex = place.photos.firstUndef();
		    if (nullIndex != -1){
			place.photos[nullIndex] = photo;
		    }
		    else {
			place.photos.push(photo);
		    }
		});
		console.dir(place.photos);
		marker	= place.marker;
		markersinfo.push({
		    lat	: marker.lat,
		    lng	: marker.lng
		});
		marker.show();
	    });
	    map.fit(markersinfo);
	    var menu = $.data(Main,'menu')
	    menu.setInfo(this);
	    menu.albumName = this.name;
	    menu.albumDesc = this.desc;
	}
    };
    Menu					= function() {
	//create option buttons
	this.$backBtn = $('<a href="#" class="mp-option-back mp-options-button" alt="Back"/>').hide();
	//fullscreen mode not really functional
	this.$modeBtn = $('<a href="#" class="mp-option-fullscreen mp-options-button" alt="Fullscreen"></a>').hide();
	this.$deleteBtn = $("<a href='#' class='mp-option-delete mp-options-button' alt='Delete' ></a>").hide();
	this.$modifyBtn = $("<a href='#' class='mp-option-modify mp-options-button' alt='Modify'></a>").hide();
	this.$addBtn = $("<a href='#' class='mp-option-add mp-options-button' alt='Add'/>").hide();
	this.$imageStatus = $("<span class='mp-status-image mp-font'>").hide();
	this.$logoutBtn = $("<a href='/logout' class='mp-option-logout mp-options-button' alt='Logout'/>").show();
	this.$centerBtn = $("<a href='#' class='mp-option-center mp-options-button' alt='Center' />").hide();
	this.$saveBtn = $("<a href='#' class='mp-option-save mp-options-button' alt='Save'>").hide();
	this.$loadBtn = $("<a href='#' class='mp-option-load mp-options-button' alt='Load'>").hide();

	//append all buttons
	this.$options		= $('<div class="mp-options"/>')
	    .append(this.$logoutBtn)
	    .append(this.$centerBtn)
	    .append(this.$saveBtn)
	    .append(this.$loadBtn)
	    .append(this.$imageStatus)
	    .append(this.$backBtn )
	    .append(this.$deleteBtn)
	    .append(this.$modifyBtn)
	    .append(this.$addBtn);
	this.$titleLbl = $('<p class="mp-label mp-font"></p>');
	
	$mpContainer.append( 
	    $('<div class="mp-options-wrapper"/>').append( this.$options ).append( this.$titleLbl )
	);

	this.$descriptionEl = $("<div class='mp-image-description mp-font ' style='overflow:auto;'/>")
	    .appendTo($mpContainer)
	    .jScrollPane( {
		verticalDragMinHeight	: 5,
		verticalDragMaxHeight	: 100,
		animateScroll		: true,
		showArrows  : true,
		horizontalGutter : 0,
		verticalGutter : 0
	    });
    };

    Menu.prototype 			= {
	hideTitleControls : function(){
	    var instance = this;
	    instance.$deleteBtn.hide();
	    instance.$modifyBtn.hide()
	    instance.$addBtn.hide();
	    instance.$centerBtn.hide();
	},
	hideStatusInformation : function(){
	    this.$imageStatus.hide();
	},
	showTitleControls : function(){
	    if($.data(Main,"cookie").isAdmin()){
    		this.$deleteBtn.show();
		this.$modifyBtn.show();
		this.$addBtn.show();
	    }
	    this.$centerBtn.show();
	},
	showStatusInformation : function(){
	    this.$imageStatus.show();
	},
	setImageStatus : function(text) {
	    var instance = this;
	    instance.$imageStatus.html(text);
	},
	setInfo : function(info){
	    if (info == null){
		info = {
		    name : this.albumName,
		    desc : this.albumDesc
		};
	    }
	    this._setName(info.name);
	    this._setDescription(info.desc);
	},
	// sets the current title
	_setName			: function( title ) {
	    this.titleLbl	= title;
	    this.$titleLbl.text( title );
	    if (!$.data(Main,"cookie").isAdmin()){
		var left  = this.$options.width()/2 - this.$titleLbl.width()/2;
		this.$titleLbl.css("left",left);
	    }
	},
	_setDescription : function (desc) {
	    var api = this.$descriptionEl.data("jsp")
	    api.getContentPane()
		.empty()
		.append($("<p style='padding:0px;margin:0px 0px;margin-top:5px;'/>").html(desc));
	    api.reinitialise();
	}
    };
    //wraps fancybox for displaying forms in overlay
    InputOverlay = function(){
	this._initialise();
    };
    InputOverlay.prototype = {
	get : function(url){
	    var instance = this;
	    $.fancybox({
		href : url,
		onComplete : instance._intercept,
		onClosed : instance._initialise
	    });
	    return this;
	},
	iFrame : function(url){
	    var instance = this;
	    $.fancybox({
		href : url,
		type : "iframe"
	    })
	    return this;
	},
	//content has been loaded
	onLoad : function(callback){
	    this._onLoads.push(callback);
	    return this;
	},
	//form has been submitted
	onForm : function(callback){
	    this._onForms.push(callback);
	    return this;
	},
	//response has been received
	onAjax : function(callback){
	    this._onAjaxs.push(callback);
	    return this;
	},
	_intercept : function(){
	    //grep 'this' 
	    var instance = $.data(Main,"inputOverlay");
	    //register form validator and grep api
	    var form = $("form.mp-dialog")
	    var api = form.validator().data("validator");
	    api.onSuccess(function(e,els){
		instance._onForm();
		//submit form with ajax call and close popup
		$.ajax({
		    type : form.attr("method"),
		    url  : form.attr("action"),
		    data : form.serialize(),
		    dataType : "json",
		    success : function(data,textStatus){
			if (data.error){
			    alert(data.error.toString());
			    return;
			}
			instance._onAjax(data);
			instance._close();
		    },
		    error : function(error){
			instance.close();
			alert(error.toString());
		    }
		});
		return false;
	    });
	    $.tools.validator.addEffect("alert",function(errors,events){
		alert("please recheck the form");
	    });
	    instance._onLoad();
	},
	_initialise : function(){
	    this._onLoads = new Array();
	    this._onForms = new Array();
	    this._onAjaxs = new Array();
	},
	//content has been loaded
	_onLoad : function(){
	    this._onLoads.forEach(function(load){
		load.call();
	    });
	    this._onLoads = new Array();
	},
	_onForm : function(){
	    this._onForms.forEach(function(form){
		form.call();
	    });
	    this._onForms = new Array();
	},
	_onAjax : function(data){
	    this._onAjaxs.forEach(function(ajax){
		ajax.call(this,data);
	    });
	    this._onAjaxs = new Array();
	},
	_close : function() {
	    $.fancybox.close();
	}
    };
    Gallery = function() {
	this.slideshow = false;
	//create and append slideshow div
	this.$galleryEl	= $('#mp-album-wrapper');
	var data	= {
	    source	: null
	};
	$('#galleryAlbumTmpl').tmpl( {tmplPhotoData : data} )
	    .appendTo( $mpContainer );
	
	this.$galleryAlbum = $('#mp-album-overlay').hide();
	this.$galleryNext = this.$galleryAlbum.find('span.mp-album-nav-next');
	this.$galleryPrev = this.$galleryAlbum.find('span.mp-album-nav-prev');
	this.$galleryClose = this.$galleryAlbum.find('span.mp-album-overlay-close');
	this.$galleryZoom = this.$galleryAlbum.find('a.mp-album-image-zoom');
	this.$currentImage = this.$galleryAlbum.find('div.mp-album-image > img');
	this.$loading = this.$galleryAlbum.find('div.mp-image-loading-small');
	this.$galleryMagnify = this.$galleryAlbum.find("div.mp-album-magnify");

	var instance = this;
	$(window).bind('resize.Gallery', function() {
	    if( instance.$galleryFullscreenImage )
		instance._resizeImage( instance.$galleryFullscreenImage );
	});
	//bind slideshow button listener
	this.$galleryClose.bind('click.Gallery', function() {
	    instance.closeSlideshow();
	});
	
	this.$galleryNext.bind('click.Gallery', function() {
	    instance._navigateSlider( instance, 'right' );
	});
	
	this.$galleryPrev.bind('click.Gallery', function() {
	    instance._navigateSlider( instance, 'left' );
	});
	
	this.$galleryZoom.bind('click.Gallery', function() {
	    instance.zoom();
	    return false;
	});
	
	this.$galleryMagnify
	    .bind("mouseover.Gallery",function(){
		if (instance.isSlideshowImage()){
		    $(this)
			.show()
			.css("opacity",".7");
		}
	    })
	    .bind("click.Gallery",function(){
		instance.zoom();
	    })
	    .bind("mouseleave.Gallery",function(){
		$(this).css("opacity",".4");
	    });
	this.galleryFullscreenCount = 5;
    };
    
    Gallery.prototype 		= {
	isSlideshow : function(){
	    return this.slideshow;
	},
	isSlideshowImage : function(){
	    return this.slideshowImage;
	},
	deletePhoto : function(photo){
	    var map = $.data( Main, 'map' );
	    var place = map.place;

	    if (photo == null) return;
	    place.photos = place.photos.filter(function(element,index){
		return element !== photo;
	    });
	    //remove from place.photos array + gallery.photos and remove a in gallery box
	    this.photos = place.photos;
	    $("a[href='"+photo.thumb+"']").remove();
	    if (photo === this.currentPhoto){
		this._navigateSlider(this,"right");
	    }
	},
	searchAnchors : function(){
	    this.$elements = this.$galleryEl.find('div.mp-album > a');
	},
	savePhoto : function(photo,order){
	    $.ajax({
		url : "/update-photo",
		type : "post",
		data : {
		    "photo-id" : photo.id,
		    "photo-name" : photo.name,
		    "photo-desc" : photo.desc,
		    "photo-order" : order
		}});
	},
	show : function( photos ) {
	    var instance	= this;
	    this.photos		= photos;
	    var tmplPhotosData 	= new Array(),
	    loaded = 0;

	    for( var i = 0, len = this.photos.length; i < len; ++i ) {
		tmplPhotosData.push( this.photos[i].thumb );
		$('<img/>').load(function() {
		    ++loaded
		    if( loaded === len ) {
			// create wrapping anchors for images
			$('#galleryTmpl')
			    .tmpl( {tmplPhotosData : tmplPhotosData} )
			    .appendTo( instance.$galleryEl );
			//search all anchors
			instance.searchAnchors();
			// make wrapping anchors sortable
			instance.$galleryEl
			    .find("div.mp-album")
			    .sortable({
				items : "a",
				update : function(event,ui){
				    newItem = ui.item;
				    oldPosition = instance.$elements.index(newItem);
				    oldList = instance.$elements;
				    instance.searchAnchors(); //update anchor array
				    newPosition = instance.$elements.index(newItem);
				    oldItem = oldList.eq(newPosition);
				    tmp = photos[newPosition];
				    photos[newPosition] = photos[oldPosition];
				    photos[oldPosition] = tmp;
				    instance.savePhoto(photos[newPosition],newPosition);
				    instance.savePhoto(photos[oldPosition],oldPosition);
				    photos[newPosition].order = newPosition;
				    photos[oldPosition].order = oldPosition;
				}
			    });
			// create scrollpane
			instance.$galleryEl.jScrollPane({
			    verticalDragMinHeight	: 40,
			    verticalDragMaxHeight	: 40,
			    animateScroll		: true	
			});
			//bind events on anchors
			instance.$elements.bind( 'mouseenter.Gallery', function( event ) {
			    var $el		= $(this),
			    photo 	= instance.photos[$el.index()];
			    $el
				.addClass('current')
				.removeClass("visited")
				.siblings('a').removeClass('current');

			}).bind( 'mouseleave.Gallery', function( event ) {
			    var $el		= $(this);
			    //add visited border if necessary
			    instance.photos[$el.index()].checkBorder();
			    $el.removeClass('current');

			}).bind( 'click.Gallery', function( event ) {
			    var $el					= $(this),
			    photo 				= instance.photos[$el.index()];
			    $el.removeClass('current');
			    
			    instance.current		= $el.index();
			    instance.currentPhoto	= instance.photos[instance.current];
			    
			    // starts little slideshow in gallery div
			    instance._startSlider();
			    //instance.zoom();
			    return false;
			});
			//draw border on visited elements
			instance.photos.forEach(function(photo){
			    photo.checkBorder();
			});
		    }
		}).attr( 'src', this.photos[i].thumb );
	    }
	},
	closeSlideshow : function(){
	    if (!this.slideshow)
		return;
	    this.slideshow = false;
	    this.slideshowImage = false;
	    this.$galleryAlbum.fadeOut("slow");
	    this.current = null;
	    this.currentPhoto = null;
	    var menu = $.data(Main,"menu");
	    //set place information
	    menu.setInfo($.data(Main,"map").place);
	    //hide image counter
	    menu.hideStatusInformation();
	},
	hide : function() {
	    //close slideshow if open
	    this.closeSlideshow();
	    this.$galleryEl.empty();
	    this.$galleryEl.removeData('jsp');
	},
	_startSlider: function() {

	    this.slideshow = true;
	    var instance = this;
	    var once = false;
	    var updateImage = function(){
		if (!once){
		    once = true
		    $('<img/>').load(function() {
			if (instance.currentPhoto) {
			    instance.currentPhoto.showBorder(true);
			}
	    		instance.$loading.hide();
			instance.$currentImage.load(function(){
			    //ugly center picture in the middle
			    if (!$.browser.msie){
				$(this).css("margin-top",(parseInt(instance.$galleryAlbum.css("height")) - parseInt(instance.$galleryAlbum.css("padding-top")) - parseInt(instance.$galleryAlbum.css("margin-bottom")) - parseInt(instance.$currentImage.height()))/2);
			    }
			    instance.$currentImage.fadeIn("slow");
			    instance.$loading.hide();
			    instance.slideshowImage = true;
			});
	    		instance.$currentImage.attr( 'src', instance.currentPhoto.source );
	    		instance._bindFullscreenListener();
			instance._updateText();
		    }).attr( 'src', instance.currentPhoto.source );
		}
		else{
		    return;
		}
	    };
	    if (this.$galleryAlbum.is(":hidden")){
		this.$galleryAlbum.fadeIn("slow",updateImage);
		this.$currentImage.hide();
	    }
	    else{
		this.$currentImage.fadeOut("slow",updateImage);
	    }
	    this.$loading.show();
	    $.data(Main, 'menu').setInfo(this.currentPhoto);
	},
	_navigateSlider					: function( instance, dir ) {
	    //navigate to next photo or close if no photos left
	    if( dir === 'right' ) {
		if( instance.current + 1 < instance.photos.length )
		    ++instance.current;
		else if (instance.photos.length > 0){
		    instance.current = 0;
		}
		else {
		    instance.current = 0;
		    instance.currentPhoto = null;
		    instance.closeSlideshow();
		    return;
		}
	    }
	    else if( dir === 'left' ) {
		if( instance.current - 1 >= 0 )
		    --instance.current;
		else if (instance.photos.length > 0)
		    instance.current = instance.photos.length - 1;
		else {
		    instance.current = 0;
		    instance.currentPhoto = null;
		    instance.closeSlideshow();
		    return;
		}
	    }
	    
	    instance.currentPhoto = instance.photos[instance.current];
	    this._startSlider();
	},
	_updateText : function(){
	    if (this.currentPhoto){
		var menu = $.data(Main,"menu");
		menu.setInfo(this.currentPhoto);
		menu.showStatusInformation();
		currentIndex = this.photos.indexOf(this.currentPhoto) + 1;
		menu.setImageStatus(currentIndex+"/"+this.photos.length);
	    }
	},
	// displays zoomed version of current image as overlay
	zoom : function() {
	    var instance	= this;
	    //disable if clause because it works only once
	    // if( !this.$galleryFullscreen ) {
	    var data	= {
		source	: this.currentPhoto.source,
		description	: this.currentPhoto.name
	    };
	    $('#galleryFullscreenTmpl').tmpl( {tmplPhotoData : data} )
		.appendTo( $mpContainer );
	    this.$galleryMagnify.hide();
	    
	    this.$galleryFullscreen = $('#mp-image-overlay');
	    this.$galleryFullscreenClose = this.$galleryFullscreen.find('span.mp-image-overlay-close');
	    this.$galleryFullscreenDescription	= this.$galleryFullscreen.find('h2.mp-label');
	    this.$galleryFullscreenImage = this.$galleryFullscreen.children('img');
	    this.$galleryFullscreenZoom = this.$galleryFullscreen.find(".mp-image-zoom");
	    
	    this._initGalleryFullscreenEvents();
	    $('<img/>').load(function() {
		instance._resizeImage( instance.$galleryFullscreenImage );
		instance.$galleryFullscreenImage.show();
		var img = $(".mp-image-overlay > img");
		//copy properties from img
		instance.$galleryFullscreenWrapper = $("<div/>")
		    .addClass("mp-image-overlay-wrapper") 
		    .css("width",img.css("width"))
		    .css("height",img.css("height"))
		    .css("margin-left",img.css("margin-left"))
		    .css("margin-top",img.css("margin-top"))
		    .css("overflow","hidden")
		    .css("cursor","auto");
		innerWrapper = $("<div/>")
		    .css("width",img.css("width"))
		    .css("height",img.css("height"));
		img.css("margin","0px 0px");
		innerWrapper.append(img)
		instance.$galleryFullscreenWrapper.append(innerWrapper);
		$(".mp-image-overlay").append(instance.$galleryFullscreenWrapper);
		innerWrapper.tzoom({
		    image:img,
		    onReady : function(){
			instance.galleryFullscreen = true;
		    },
		    fadeIn : 1000
		});
		
	    }).attr( 'src', this.currentPhoto.source );
	},
	// bind hide functionality to close button
	_initGalleryFullscreenEvents	: function() {
	    var instance	= this;
	    $("div.mp-image-nav")
		.find("span.mp-image-nav-next")
		.bind("click.Gallery",function(event){
		    instance.$galleryFullscreenClose.trigger("click");
		    instance._navigateSlider(instance,"right");	
		    instance.zoom();
		})
		.end()
		.find("span.mp-image-nav-prev")
		.bind("click.Gallery",function(event){
		    instance.$galleryFullscreenClose.trigger("click");
		    instance._navigateSlider(instance,"left");	
		    instance.zoom();
		});
	    this.$galleryFullscreenClose.bind('click.Gallery', function() {
		//remove since it will be recreated with every call to gallery.zoom()
		instance.galleryFullscreen = false;
		instance.$galleryFullscreen.fadeOut("slow").remove();
	    });	
	    this.$galleryFullscreenImage.bind("mouseover.Gallery",function(){
		if (instance.galleryFullscreen && instance.galleryFullscreenCount > 0){
		    instance.galleryFullscreenCount -= 1;
		    var $wrapper = instance.$galleryFullscreenWrapper;
		    var position = {
		    	left : $wrapper.position().left,
		    	top : $wrapper.position().top
		    };
		    lowOpacity  = {opacity : 0.1};
		    highOpacity = {opacity : 0.8};
		    duration = 1500;
		    //animate blinking
		    instance.$galleryFullscreenZoom
			.css("left",position.left)// - instance.$galleryFullscreenZoom.width()/2)
			.css("top",position.top) //-  instance.$galleryFullscreenZoom.height()/2)
			.css("opacity",0.1)
			.show()
		    	.animate(highOpacity,duration)
			.animate(lowOpacity,duration)
			.animate(highOpacity,duration)
			.animate(lowOpacity,duration,function(){
			    instance.$galleryFullscreenZoom.hide();
			});
		}
	    });
	},
	// adjust height and weight properties of image so that it fits current window size
	_resizeImage					: function( $image ) {
	    var widthMargin		= 50,
	    heightMargin 	= 2 * this.$galleryFullscreenDescription.height(),
	    
	    windowH      	= $(window).height() - heightMargin,
	    windowW      	= $(window).width() - widthMargin,
	    theImage     	= new Image();
	    
	    theImage.src     	= $image.attr("src");
	    
	    var imgwidth     	= theImage.width,
	    imgheight    	= theImage.height;

	    if((imgwidth > windowW) || (imgheight > windowH)) {

		if(imgwidth > imgheight) {
		    var newwidth 	= windowW,
		    ratio 		= imgwidth / windowW,
		    newheight 	= imgheight / ratio;
		    
		    theImage.height = newheight;
		    theImage.width	= newwidth;
		    
		    if(newheight > windowH) {
			var newnewheight 	= windowH,
			newratio 		= newheight/windowH,
			newnewwidth 	= newwidth/newratio;
			theImage.width 		= newnewwidth;
			theImage.height		= newnewheight;
		    }
		}
		else {
		    var newheight 	= windowH,
		    ratio 		= imgheight / windowH,
		    newwidth 	= imgwidth / ratio;
		    theImage.height = newheight;
		    theImage.width	= newwidth;
		    
		    if(newwidth > windowW) {
			var newnewwidth 	= windowW,
			newratio 		= newwidth/windowW,
			newnewheight 	= newheight/newratio;
			theImage.height 	= newnewheight;
			theImage.width		= newnewwidth;
		    }
		}
	    }
	    
	    $image.css({
		'width'			: theImage.width + 'px',
		'height'		: theImage.height + 'px',
		'margin-left'	: -theImage.width / 2 + 'px',
		'margin-top'	: -theImage.height / 2 + this.$galleryFullscreenDescription.height() / 2 + 'px'
	    });	
	    
	},
	_bindFullscreenListener : function(){
	    //problem: every time the slider is started the events get bound and get fired several times
	    //unbind all events first, then bind a new one
	    var instance = this;
	    instance.$currentImage
		.unbind(".GalleryZoom")
		.bind("mouseover.GalleryZoom",function(){
		    if (instance.isSlideshowImage()){
			var position = { 
			    top : parseInt(instance.$currentImage.css("margin-top")),
			    left : instance.$currentImage.position().left
			};
			instance.$galleryMagnify
			    .css("left",position.left + instance.$currentImage.width()/2 - instance.$galleryMagnify.width()/2)
			    .css("top",position.top + instance.$currentImage.height()/2 - instance.$galleryMagnify.height()/2)
			    .show();
		    }
		})
		.bind("mouseleave.GalleryZoom",function(){
		    instance.$galleryMagnify.hide();
		});
	}

    };

    Cookie = function(){
	value = $.cookie("visited") || new String("");
	this._parseValue(value);
	this.saveState = this.NOT_SAVE;
	//try to retrive slot name from cookie
	this.slot = $.cookie("slot");
	this.user = $.cookie("user");
	this.SAVE = 1;
	this.NOT_SAVE = 0;
	this._year = 356 * 24 * 60 * 60 * 1000;
	this._cookieSetting = {
	    expires : new Date().add({years : 1}),
	    maxAge : this.year
	};
    };

    Cookie.prototype = {
	isAdmin : function(){
	    return this.user === "admin";
	},
	reinitialise : function (value){
	    if (value == null) return;
	    this._parseValue(value);
	    var map = $.data(Main,"map");
	    placesId = this._normalize(this.photos);
	    photosId = this._normalize(this.places);

	    map.places.forEach(function(place){
		if(placesId.indexOf(place.id)){
		    place.visited = true;
		    place.showVisitedIcon();
		}
		place.photos.forEach(function(photo){
		    if (photosId.indexOf(photo.id)){
			photo.visited = true;
		    }
		});
	    });
	},
	_parseValue : function(value){
	    this.value  = value.split(",");
	    this.places = this.value.filter(function(el){
	    	return el.match(/place/);
	    });
	    this.photos = this.value.filter(function(el){
	    	return el.match(/photo/);
	    });
	},
	_normalize : function(elements){
	    deepCopy = new Array();
	    elements.forEach(function(element){
		deepCopy.push(parseInt(element));
	    });
	    return deepCopy;
	},		       
	//set slot and addtionally save it as cookie
	setSlot : function(slot){
	    this.slot = slot;
	    $.cookie("slot",this.slot,this._cookieSettings);
	},
	isVisitedPhoto : function(id){
	    index = this.photos.indexOf("photo-"+id);
	    if (index == -1)
		return false;
	    return true;
	},
	isVisitedPlace : function(id){
	    index = this.places.indexOf("place-"+id);
	    if (index == -1)
		return false;
	    return true;
	},
	addPlace : function(id){
	    if (this.places.indexOf("place-"+id) == -1){
		this.places.push("place-"+id);
		this._writeCookie();
	    }
	},
	addPhoto : function(id){
	    if (this.photos.indexOf("photo-"+id) == -1){
		this.photos.push("photo-"+id);
		this._writeCookie();
	    }
	},
	_writeCookie : function(){
	    this.value = this.places.join(",")+","+this.photos.join(",");
	    $.cookie("visited",this.value,this._cookieSettings);
	}
    };

    var $mpContainer		= $('#mp-container'),
    Main	= (function() {
	
	var init	= function() {
	    // instance of Cookie
	    $.data(Main, 'cookie', new Cookie());
	    // instance of Map
	    $.data(Main, 'map', new Map() );
	    // instance of Menu
	    $.data(Main, 'menu', new Menu() );
	    // instance of Gallery
	    $.data(Main, 'gallery', new Gallery() );
	    // overlay for editing
	    $.data(Main,"inputOverlay",new InputOverlay());

	    var mapPhotoAlbum 	= new MapPhotoAlbum();
	    mapPhotoAlbum.init(); 
	};
	return { init : init };
    })();

    $mpContainer.data({
	originalWidth	: $mpContainer.width(),
	originalHeight	: $mpContainer.height()
    });
    Main.init();	
});
