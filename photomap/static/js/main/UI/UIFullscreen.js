var UI = {};

UIFullscreen = function(gallery){
    this.gallery = gallery;
    this.iconHelpCount = 5;
    this.$fullscreen = null;
    this.$close = null;
    this.$name = null;
    this.$image = null;
    this.$zoom = null;
    this.$load = null;
    this.$wrapper = null;
    
};

UIFullscreen.prototype = {

    // displays zoomed version of current image as overlay
    zoom : function() {
	var instance	= this;
	//disable if clause because it works only once
	// if( !this.$fullscreenEl ) {
	var data	= {
	    source	: main.getUIState().getCurrentPhoto().source,
	    description	: main.getUIState().getCurrentPhoto().name
	};
	$mpContainer.append($.jqote('#galleryFullscreenTmpl', {tmplPhotoData : data} ));
	
	this.$fullscreen = $('#mp-image-overlay');
	this.$close = this.$fullscreen.find('img.mp-image-overlay-close');
	this.$name = this.$fullscreen.find('h2.mp-label');
	this.$image = this.$fullscreen.children("img.mp-image-full");
	this.$zoom = this.$fullscreen.find("img.mp-image-zoom");
	this.$load = this.$fullscreen.find("img.mp-loading");
	
	this.bindListener();
	$('<img/>').load(function() {
	    instance._resizeImage( instance.$image );
	    instance.$image.show();

	    //shortcut
	    var img = instance.$image;

	    //copy properties from img to wrap img for tzoom library
	    instance.$wrapper = 
		$("<div/>")
		.addClass("mp-image-overlay-wrapper") 
		.css("margin-left",img.css("margin-left"))
		.css("margin-top",img.css("margin-top"))
		.css("overflow","hidden")
		.css("cursor","auto")
	    	.width(img.width)
		.height(img.height);

	    innerWrapper = $("<div/>")
		.css("width",img.css("width"))
		.css("height",img.css("height"));
	    img.css("margin","0px 0px");
	    innerWrapper.append(img)
	    instance.$wrapper.append(innerWrapper);


	    $(".mp-image-overlay").append(instance.$wrapper);
	    
	    //hide border during fadein
	    var border = 
		instance.$wrapper.css("border-top-width")+
		" "+
		instance.$wrapper.css("border-top-style")+
		" "+
		instance.$wrapper.css("border-top-color");

	    instance.$wrapper.css("border","0px");

	    innerWrapper.tzoom({
		image:img,
		onReady : function(){
		    main.getUIState().setFullscreen(true);
		},
		onLoad : function(){
		    instance.$load.hide();
		    instance.$wrapper.css("border",border);
		}
	    });
	    
	}).attr( 'src', main.getUIState().getCurrentPhoto().source );
    },

    // adjust height and weight properties of image so that it fits current window size
    _resizeImage					: function( $image ) {
	var widthMargin		= 50,
	heightMargin 	= 2 * this.$name.height(),
	
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
	    'margin-top'	: -theImage.height / 2 + this.$name.height() / 2 + 'px'
	});	
	
    },

    // bind hide functionality to close button
    bindListener	: function() {
	var instance	= this;
	$("div.mp-image-nav")
	    .find("img.mp-image-nav-next")
	    .bind("click.Gallery",function(event){
		instance.$close.trigger("click");
		instance.gallery.navigateSlider(instance,"right");	
		instance.zoom();
	    })
	    .end()
	    .find("img.mp-image-nav-prev")
	    .bind("click.Gallery",function(event){
		instance.$close.trigger("click");
		instance.gallery.navigateSlider(instance,"left");	
		instance.zoom();
	    });
	this.$close.bind('click.Gallery', function() {
	    //remove since it will be recreated with every call to gallery.zoom()
	    main.getUIState().setFullscreen(false);
	    instance.$fullscreen.fadeOut("slow").remove();
	});	
	this.$image.bind("mouseover.Gallery",function(){
	    if (main.getUIState().isFullscreen() && instance.iconHelpCount > 0){
		instance.iconHelpCount -= 1;
		var $wrapper = instance.$wrapper;
		var position = {
		    left : $wrapper.position().left,
		    top : $wrapper.position().top
		};
		lowOpacity  = {opacity : 0.1};
		highOpacity = {opacity : 0.8};
		duration = 1500;
		//animate blinking
		instance.$zoom
		    .css("left",position.left)// - instance.$zoom.width()/2)
		    .css("top",position.top) //-  instance.$zoom.height()/2)
		    .css("opacity",0.1)
		    .show()
		    .animate(highOpacity,duration)
		    .animate(lowOpacity,duration)
		    .animate(highOpacity,duration)
		    .animate(lowOpacity,duration,function(){
			instance.$zoom.hide();
		    });
	    }
	});
    },
};


