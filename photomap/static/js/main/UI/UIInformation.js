UIInformation = function(){
	
    //root action bar
    
    this.$wrapper = $("#mp-photo-description");
    this.$bottomPanel = $(".mp-bottom-panel");
    this.$album = $("#mp-album");
    //this.$titleWrapper = null;
    this.$close = $(".mp-description-overlay-close");
    this.$infoButton = $(".mp-option-information").show();

    this.$description = $(".mp-description-wrapper").jScrollPane();
    
    // title and image count
    //this.$title = null;
    this.$imageNumber = this.$wrapper.find(".mp-status-image");
    
    //show tooltip
    //this.showTooltips();
    
    this.bindListener();
    
};

UIInformation.prototype = {
    
    init : function(){
	this.placeDescription();
    },
    
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
	alert(this.albumName);
	this.setAlbumTitel(this.albumName);
	this._setTitle(title);
	this._setDescription(info.desc);
    },
    // sets the current title
    _setTitle			: function( title ) {
	this.titleLbl	= title;
	//this.$title.text( title );

	//calculate font size once for both image count and image name
	if (!main.getUIState().getFontSize()){
	    //desiredWidth = this.$titleWrapper.width();
	    //desiredHeight = this.$titleWrapper.height();
	    //size = main.getUI().getTools().calculateFontSize(title,desiredWidth,desiredHeight);
	    //main.getUIState().setFontSize(size);
	    //this.$title.css("font-size",size+"px");
	    this.$imageNumber.css("font-size",size+"px");
	}

	//center text
	//left  = this.$controls.width()/2 - this.$title.width()/2;
	//this.$title.css("left",left);
	
    },
    setAlbumTitel : function(title){
	$(".mp-page-title h1").text(title);
    },
    _setDescription : function (desc) {
	api = this.$description.data('jsp');
	api.getContentPane()
	    .find("p")
	    .empty()
	    .html(desc);
	if (this.$wrapper.is(":hidden")){
	    this.$wrapper.show();
	};
	api.reinitialise();
    },
    
    placeDescription : function () {
	// resizing and repositioning description wrapper
	$map = $(".mp-map");
	mapOffset = $map.offset();
	topOffset = mapOffset.top + (0.5 * (0.25 * $map.height()));
	leftOffset = mapOffset.left + (0.65 * (0.125 * $map.width()));
	descriptionWidth = 0.375 * $map.width();
	descriptionHeight = 0.75 *$map.height();
	this.$wrapper
	    .width(descriptionWidth)
	    .height(descriptionHeight)
	    .offset({top: topOffset, left: leftOffset});
	    
	// reposition closing "button"
	imgHeight = this.$close.height();
	imgWidth = this.$close.width();
	closeButtonOffset = {
	    top: topOffset - (0.5 * imgHeight),
	    left: leftOffset + descriptionWidth - (0.5 * imgWidth)
	}
	this.$close.offset(closeButtonOffset);
    },
    
    closeDescription : function(){
	this.$wrapper.fadeOut(500);
    },
    
    toggleDescription : function(){
	if (this.$wrapper.is(":visible")){
	    this.$wrapper.fadeOut(500);
	}
	else {
	    this.$wrapper.fadeIn(500);
	}
    },
    
    /*showTooltips : function(){
	this.$controls.find("img[title]").tooltip({
	    effect: 'slide',
	    direction: 'right',
	    bounce: true,
	    position: 'bottom left',
	    opacity: 0.9,
	    offset: [0,20],
	    predelay: 500,
	    });
	this.$bottomPanel.find("a[title]").tooltip({
	    effect: 'slide',
	    //direction: 'right',
	    bounce: true, 
	    position: 'top center',
	    opacity: 0.9,
	    //offset: [0,20],
	    predelay: 500,
	    });
    },*/
    
    bindListener : function(){
	instance = this;
	this.$close.bind('click',function(){
	    instance.closeDescription();
	});
	this.$infoButton.bind('click',function(){
	    instance.toggleDescription();
	});
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
