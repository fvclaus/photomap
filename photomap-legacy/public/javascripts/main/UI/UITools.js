UITools = function(){
};

UITools.prototype = {

    calculateFontSize : function(title,desiredWidth,desiredHeight){
	size = 1;
	$fontEl = $("<div class='mp-invisible mp-font'/>")
	    .text(title)
	    .appendTo($("body"))
	    .css("font-size",size+"px");
	do{
	    $fontEl.css("font-size",(size++)+("px"));
	}
	while($fontEl.width() < desiredWidth && $fontEl.height() < desiredHeight);
	$fontEl.remove();
	return size-1;
    },

    deletePhoto : function(photo){
	place = main.getUIState().getCurrentPlace();

	if (photo == null) return;
	place.photos = place.photos.filter(function(element,index){
	    return element !== photo;
	});
	//remove from place.photos array + gallery.photos and remove a in gallery box
	main.getUIState().setPhotos(place.photos);
	$("a[href='"+photo.thumb+"']").remove();
	if (photo === this.currentPhoto){
	    main.getUI().getGallery().navigateSlider(this,"right");
	}
    },

    
};
