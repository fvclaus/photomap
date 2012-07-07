UIInformation = function(){
	
    //root action bar
    
    this.$wrapper = $(".mp-photo-description");
    this.$controls = $(".mp-controls");
    this.$album = $("#mp-album");
    this.$titleWrapper = $(".mp-album-title-wrapper")

    this.$description = 
	$(".mp-description-wrapper")
	.height(0.75 * this.$wrapper.height())
	.width(this.$wrapper.width() )
	.jScrollPane( {
	    verticalDragMinHeight	: 5,
	    verticalDragMaxHeight	: 100,
	    animateScroll		: true,
	    showArrows  : true,
	    horizontalGutter : 0,
	    verticalGutter : 0
	});
    
    // title and image count
    this.$title = this.$album.find(".mp-album-title-wrapper").find('p.mp-label.mp-font').show();
    this.$imageNumber = this.$wrapper.find(".mp-status-image");
    // calculate width and height
    
    
};

UIInformation.prototype = {
    
    setInfo : function(info){
	if (this.albumName == null) {
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
	var api = this.$description.data("jsp")
	api.getContentPane()
	    .empty()
	    .append($("<p style='padding:0px;margin:0px 0px;margin-top:5px;'/>").html(desc));
	api.reinitialise();
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
