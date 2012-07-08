UIInformation = function(){
	
    //root action bar
    
    this.$wrapper = $("#mp-photo-description");
    this.$controls = $(".mp-controls");
    this.$album = $("#mp-album");
    this.$titleWrapper = $(".mp-album-title-wrapper")

    this.$description = 
	$(".mp-description-wrapper")
	.height(this.$wrapper.height())
	.width(this.$wrapper.width());
    
    // title and image count
    this.$title = this.$album.find(".mp-album-title-wrapper").find('p.mp-label.mp-font').show();
    this.$imageNumber = this.$wrapper.find(".mp-status-image");
    // resize description div
    this.resizeRepositionDescription();
    
};

UIInformation.prototype = {
    
    setInfo : function(info){
	if (info == null){
	    info = {
		name : this.albumName,
		desc : this.albumDesc
	    };
	    title = info.name;
	}
	else if (this.albumName == null) {
	    title = info.name;
	}
	else {
	    info.albumName = this.albumName;
	    title = info.albumName + " >> " + info.name;
	}
	this._setTitle(title);
	this._setDescription(info.desc);
    },
    // sets the current title
    _setTitle			: function( title ) {
	this.titleLbl	= title;
	this.$title.text( title );

	//calculate font size once for both image count and image name
	if (!main.getUIState().getFontSize()){
	    desiredWidth = this.$titleWrapper.width();
	    desiredHeight = this.$titleWrapper.height();
	    size = main.getUI().getTools().calculateFontSize(title,desiredWidth,desiredHeight);
	    main.getUIState().setFontSize(size);
	    this.$title.css("font-size",size+"px");
	    this.$imageNumber.css("font-size",size+"px");
	}

	//center text
	left  = this.$controls.width()/2 - this.$title.width()/2;
	this.$title.css("left",left);
	
    },
    _setDescription : function (desc) {
	var api = this.$description;
	api.empty().append($("<p style='padding:0px;margin:0px 0px;margin-top:5px;'/>").html(desc));
	api.css('height','100%').css('width','100%');
    },
    
    resizeRepositionDescription : function () {
	$map = this.$wrapper.parent();
	$closeImage = $(".mp-description-overlay-close");
	mapOffset = $map.offset();
	topOffset = mapOffset.top + (0.5 * (0.25 * $map.height()));
	leftOffset = mapOffset.left + (0.5 * (0.25 * $map.width()));
	descriptionWidth = 0.75 * $map.width();
	descriptionHeight = 0.75 * $map.height();
	this.$wrapper
	    .width(descriptionWidth)
	    .height(descriptionHeight)
	    .offset({top: topOffset, left: leftOffset});
	    //.css('margin',topOffset + 'px ' + leftOffset + 'px');
	    
	// reposition closing "button"
	imgHeight = $closeImage.height();
	imgWidth = $closeImage.width();
	closeButtonOffset = {
	    top: topOffset - (0.5 * imgHeight),
	    left: leftOffset + descriptionWidth - (0.5 * imgWidth)
	}
	$closeImage.offset(closeButtonOffset);
	    
    },

    hideImageNumber : function(){
	this.$imageNumber.hide();
    },
    
    showImageNumber : function(){
	this.$imageNumber.show();
    },
    setImageNumber : function(text) {
	this.$imageNumber.html(text);
    },
};
