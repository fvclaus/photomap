UIControls = function(maxHeight) {
    
    //currently photo only
    this.$controls = $(".mp-controls-wrapper");
    this.$controls.hide();
    // icons of photo controls are not scaled yet
    this.$controls.isScaled = false;
    // tells the hide function whether or not the mouse entered the window
    this.$controls.isEntered = false;

    this.$delete = $("img.mp-option-delete");
    this.$update = $("img.mp-option-modify");

    this.$logout = $(".mp-option-logout");
    this.$center = $(".mp-option-center");

};

UIControls.prototype = {
    
    init : function(){
	this.placeCenterControl();

	this.bindListener();

	height = main.getUI().getPanel().getFooterHeight();
	this.$logout.height(height);

    },
    placeCenterControl : function(){
	//reposition
	this.$center.show();
	position = $("#mp-map").position();

	position.top += $("#mp-header").height() * 2.25;
	position.left += $("#mp-header").height() * 0.35;
	this.$center.css({
	    'top' : position.top,
	    'left' : position.left
	    })
	    .hide();
    },
    
    /*
      @author: Frederik Claus
      @summary: displays modify control under a photo
      @param $el: the photo element under which controls are placed
    */
    showPhotoControls : function($el){
	center = $el.offset();
	tools = main.getUI().getTools();
	center.left += tools.getRealWidth($el)/2;
	center.top += tools.getRealHeight($el);

	// clear any present timeout, as it will hide the controls while the mouspointer never left
	if(this.hideControlsTimeoutId){
	    window.clearTimeout(this.hideControlsTimeoutId);
	    this.hideControlsTimeoutId = null;
	}
	this.showControls(center);
	this.setModifyPhoto(true);

    },
    
    /*
      @author: Frederik Claus
      @summary: modify controls are instantiated once and are used for places and photos
      @param center: the bottom center of the element where the controls should be displayed
    */

    showControls : function(center){
	// calculate the offset
	tools = main.getUI().getTools();
	// center the controls below the center
	center.left  -= tools.getRealWidth(this.$controls)/2;

	// offset had a weird problem where it was pushing the controls down with every 2 consecutive offset calls
	this.$controls
	    .css({
		top: center.top,
		left: center.left
	    })
	    .show();

	// don't resize the icons all the time to save performance
	if (!this.$controls.isScaled){
	    this.$controls
		.find(".mp-controls-options")
		.height(this.$controls.height() * 0.8)
		.width(this.$controls.width() * 0.45);
	}
	
    },
    
    setModifyAlbum : function(active){
	this.isModifyAlbum = active;
	this.isModifyPlace = !active;
	this.isModifyPhoto = !active;
    },

    setModifyPlace : function(active){
	this.isModifyPlace = active;
	this.isModifyAlbum = !active;
	this.isModifyPhoto = !active;
    },
    
    setModifyPhoto : function(active){
	this.isModifyPhoto = active;
	this.isModifyPlace = !active;
	this.isModifyAlbum = !active;
    },

    /*
      @author: Frederik Claus
      @summary: hides the modfiy controls
      @param timeout: boolean, if the controls should be hidden after a predefined timout, when the controls are not entered
    */
    hideControls : function(timeout){
	var instance = this;
	hide = function(){
	    if(instance.$controls.isEntered){
		return;
	    }
	    instance.$controls.hide();
	};

	if(timeout){
	    this.hideControlsTimeoutId = window.setTimeout(hide,1000);
	}
	else{
	    this.$controls.hide();
	}
    },
    

    bindInsertPhotoListener : function(){

	this.$insert = $(".mp-option-add");
	//commit in iframe because of img upload
	this.$insert
	    .remove("click.PhotoMap")
	    .bind("click.PhotoMap",function(event){
	    place = main.getUIState().getCurrentPlace();
	    // reset load function 
	    main.getUI().getInput().iFrame("/insert-photo?place="+place.id);
	});
    },

    bindListener : function(){

	var instance = this;
	this.$delete.unbind("click").bind("click",function(event){
	    // hide current place's markers and clean photos from gallery
	    state = main.getUIState();	
	    photo = state.getCurrentPhoto();
	    place = state.getCurrentPlace();
	    album = state.getCurrentAlbum();
	    var url,data;
	    
	    // delete current photo
	    if (instance.isModifyPhoto) {
		if(confirm("Do you really want to delete photo " + photo.name)){
		    url = "/delete-photo",
		    data = {"id":photo.id};
		    //deletes photo from gallery and moves or hides slider
		    main.getUI().getTools().deletePhoto(photo);
		}
		else 
		    return;
	    }

	    // delete current place
	    else if(instance.isModifyPlace){
		if(confirm("Do you really want to delete place " + place.name)){
		    url = "/delete-place";
		    data = {"id":place.id};
		    main.getUIState().removePlace(place);
		    main.getUI().getInformation().hidePlaceTitle();
		    place._delete();
		}
		else
		    return;
	    }

	    // delete current album
	    else if(instance.isModifyAlbum){
		if(confirm("Do you really want to delete Album " + album.name)){
		    url = "/delete-album";
		    data = {"id":album.id};
		    album._delete();
		}
		else
		    return;
	    }
	    else{
		alert("I don't know what to delete. Did you set one of setModify{Album,Place,Photo}?");
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

	this.$update.unbind("click").bind("click",function(event){
	    var state = main.getUIState();	
	    var place = state.getCurrentPlace();
	    var photo = state.getCurrentPhoto();
	    var album = state.getCurrentAlbum();
	    
	    // edit current photo
	    if (instance.isModifyPhoto) {

		main.getUI().getInput()
		    .onLoad(function(){
			//prefill with values from selected picture
			$("input[name=id]").val(photo.id);
			$("input[name=order]").val(photo.order);
			var $name = $("input[name=title]").val(photo.name);
			var $desc = $("textarea[name=description]").val(photo.desc);

			main.getUI().getInput().onForm(function(){
			    //reflect changes locally
			    photo.name = $name.val();
			    photo.desc = $desc.val();
			});
		    })
		    .get("/update-photo");
	    }

	    //edit current place
	    else if (instance.isModifyPlace){
		//prefill with name and update on submit

		main.getUI().getInput()
		    .onLoad(function(){
			$("input[name=id]").val(place.id);
			var $name = $("input[name=title]").val(place.name);
			var $desc = $("textarea[name=description]").val(place.desc);

			main.getUI().getInput().onForm(function(){
			    //reflect changes locally
			    place.name = $name.val();
			    place.desc = $desc.val();
			    main.getUI().getInformation().updatePlace(place);
			});
		    })
		    .get("/update-place");
	    }
	    
	    //edit current album
	    else if (instance.isModifyAlbum){
		//prefill with name and update on submit

		main.getUI().getInput()
		    .onLoad(function(){
			$("input[name=id]").val(album.id);
			var $name = $("input[name=title]").val(album.name);
			var $desc = $("textarea[name=description]").val(album.desc);

			main.getUI().getInput().onForm(function(){
			    //reflect changes locally
			    album.name = $name.val();
			    album.desc = $desc.val();
			});
		    })
		    .get("/update-album");
	    }
	});
	
	this.$controls
	    .bind("mouseleave",function(){
		instance.$controls.hide();
		instance.$controls.isEntered = false;
	    })
	    .bind("mouseenter",function(){
		instance.$controls.isEntered = true;
	    });
	
	
	this.$center.bind("click.MapPhotoAlbum",function(event){
	    var place = main.getUIState().getCurrentPlace();
	    if (place){
		place.center();
	    }
	});
    },

    

};
