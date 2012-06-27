UIInformation = function(){
    //root action bar
    this.$wrapper = $(".mp-status-wrapper").height(0.2*$("body").height());
    // buttons

    this.$controls = $('.mp-options-wrapper');
    this.$controls.height(0.25 * this.$wrapper.height());
    
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
    this.$name = this.$wrapper.find('p.mp-label.mp-font').show();
    this.$imageNumber = this.$wrapper.find(".mp-status-image");
    // calculate width and height
    
    
};

UIInformation.prototype = {
    
    getControlsBarHeight : function(){
	return this.$controls.height();
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
	this.$name.text( title );

	//calculate font size once for both image count and image name
	if (!main.getUIState().getFontSize()){
	    
	    desiredWidth = this.$controls.width();
	    desiredHeight = this.$controls.height();
	    size = main.getUI().getTools().calculateFontSize(title,desiredWidth,desiredHeight);
	    main.getUIState().setFontSize(size);
	    this.$name.css("font-size",size+"px");
	    this.$imageNumber.css("font-size",size+"px");
	}

	//center text
	left  = this.$controls.width()/2 - this.$name.width()/2;
	this.$name.css("left",left);
	
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
