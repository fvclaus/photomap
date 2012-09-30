UITools = function(){
};

UITools.prototype = {

    calculateFontSize : function(title,desiredWidth,desiredHeight){
	size = 1;
	$fontEl = $("<div class='mp-font'></div>")
	    .text(title)
	    .appendTo($("body"))
	    .css("fontSize",size+"px");
	do{
	    $fontEl.css("fontSize",(size++)+("px"));
	}
	while($fontEl.width() < desiredWidth && $fontEl.height() < desiredHeight);
	$fontEl.remove();
	return size-1;
    },

    getRealHeight : function($el){
	return $el.height() + this.getCss2Int($el,
					      ["border-bottom-width",
					       "border-top-width",
					       "margin-bottom",
					       "margin-top"]);
    },

    getRealWidth : function($el){
	return $el.width() + this.getCss2Int($el,
					     ["border-left-width",
					      "border-right-width",
					      "margin-left",
					      "margin-right"]);
    },

    getCss2Int : function($el,attributes){
	if (typeof(attributes) == "object"){
	    var total = 0;
	    attributes.forEach(function(attribute){
		value =  parseInt($el.css(attribute));
		if (value){
		    total += value;
		}
	    });
	    return total;
	}
	else{
	    return parseInt($el.css(attributes));
	}
    },

		

    deletePhoto : function(photo){
	state = main.getUIState();
	place = state.getCurrentPlace();
	currentPhoto = state.getCurrentPhoto();

	if (photo == null) return;
	place.photos = place.photos.filter(function(element,index){
	    return element !== photo;
	});
	//remove from place.photos array + gallery.photos and remove a in gallery box
	state.setPhotos(place.photos);
	$("div.mp-gallery > img[src='"+photo.thumb+"']").remove();
	if (photo === currentPhoto){
	    main.getUI().getGallery().navigateSlider(this,"right");
	}
    },

    getAbsoluteUrl : function(url){
	a = document.createElement("a");
	a.href = url;
	return a.href;
    },
    
    getUrlParameterByName : function (name){
      name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
      var regexS = "[\\?&]" + name + "=([^&#]*)";
      var regex = new RegExp(regexS);
      var results = regex.exec(window.location.search);
      if(results == null)
	return "";
      else
	return decodeURIComponent(results[1].replace(/\+/g, " "));
    },
    
    deleteObject : function(url,data){
	// post request to delete album/place/photo - data is the id of the object
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
	    },
	});
	},
	    
    fitMask : function($maskID){
	// fit mask of overlay/expose/fancybox on top map between header and footer
	$maskID.css({
	  'max-height': $('#mp-map').height(),
	  'max-width': $('#mp-map').width(),
	  'top': $('#mp-map').offset().top,
	  'left': $('#mp-map').offset().left,
	  'z-index': 1000,
	});
    },
    
    loadOverlay : function($trigger){
	$trigger
	    .overlay({
		top: '25%',
		load: true,
		mask: {
			color: "white",
			opacity: 0.7,
		},
	    })
	    .load();
    },
    
    openShareURL : function(){
	url = "" + main.getUIState().getAlbumShareURL().url;
	
	this.loadOverlay($(".mp-share-overlay"));
	this.fitMask($("#exposeMask"));
	//load link in input field and highlight it
	$("#mp-share-link")
	    .val(url)
	    .focus(function(){$(this).select();})
	    .focus();
	main.getUI().getControls().copyListener();
    },
    checkFiles : function(files){
	allowedFileTypes = ['image/png','image/jpeg'];
	errors = [
	    'You can upload just one Photo at a time!',
	    'File-Type not allowed. Just *.jpeg and *.png are supported.'
	    ];
	// return if more than one file is dropped into the gallery
	if (files.length > 1){
	    result = {
		'success' : false,
		'error' : errors[0]
	    };
	    return result;
	}
	// return if the file type is not allowed
	if (!files[0].type || $.inArray(files[0].type, allowedFileTypes) < 0) {
	    result = {
		'success' : false,
		'error' : errors[1]
	    };
	    return result;
	}
	
	// if everything is correct proceed
	return {'success': true};
	    
    },
};
