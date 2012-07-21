UIControls = function(maxHeight) {

    this.$controls = $('.mp-controls');
    this.$controls.height(maxHeight);

    this.$delete = $(".mp-option-delete");
    this.$modify = $(".mp-option-modify");
    this.$logout = this.$controls.find(".mp-option-logout").show();
    this.$center = $(".mp-option-center");
    this.$add = $(".mp-option-add");
    
    this.bindListener();

};

UIControls.prototype = {
    
    init : function(){
	this.repositionCenterControl();
    },
    
    setAddControl : function(){
	this.$add = $(".mp-option-add");
    },

    hideControls : function(){
	var instance = this;
	instance.$delete.hide();
	instance.$modify.hide()
	instance.$add.parent().hide();
	instance.$center.hide();
    },

    showControls : function(){
	if(main.getClientState().isAdmin()){
    	    this.$delete.show();
	    this.$modify.show();
	    this.$add.parent().show();
	}
	this.$center.show();
    },
    
    repositionCenterControl : function(){
	$centerElement = this.$center.show();
	position = $("#mp-map").position();
	position.top += $("#mp-header").height() * 0.5
	position.left += 5;
	$centerElement.css('top',position.top).css('left',position.left);
	$centerElement.hide()
    },
    
    resizeRepositionAddControl : function(){
	// bugfix for empty places
	heightWrapper = $(".mp-album-wrapper").height() * 0.2; 
	$(".mp-option-add-wrapper").css('height',heightWrapper)
	
	// resize & reposition add control
	height = this.$add.parent().height() * 0.45;
	marginTop = ( this.$add.parent().height() - height ) * 0.5;
	marginLeft = ( this.$add.parent().width() - height ) * 0.5;
	this.$add.css('height',height).css('width',height).css('margin-top',marginTop).css('margin-left',marginLeft);
    },
    
    showPhotoControls : function(element,photo){
	
	$(".mp-gallery").append($.jqote( '#photoControlsTmpl', {} ));
	offset = element.offset();
	offset.top += element.height() + 4;
	offset.left += 1;
	console.log(position);
	size = {
	    x: element.width() + 4,
	    y: element.height() * 0.2,
	};
	console.log(size);
	$wrapper = $(".mp-photo-controls-wrapper");
	$wrapper.width(size.x);
	$wrapper.height(size.y);
	$wrapper.offset(offset);
	$wrapper.find(".mp-photo-controls").height($wrapper.height());
	$wrapper.find(".mp-photo-controls").width($wrapper.width() * 0.15);
	
	this.bindListener();
    },
    
    hidePhotoControls : function(){
	
	$(".mp-photo-controls-wrapper").detach();
	
    },

    bindListener : function(){	

	var instance = this;
	this.$delete.bind("click.MapPhotoAlbum",function(event){
	    // hide current place's markers and clean photos from gallery
	    state = main.getUIState();	
	    photo = state.getCurrentPhoto();
	    place = state.getCurrentPlace();
	    // album = state.getCurrentAlbum();
	    var url,data;
	    
	    
	    if (instance.$delete.hasClass(".mp-element-photo")) {
		if(confirm("Do you really want to delete photo "+photo.name)){
		    url = "/delete-photo",
		    data = {"id":photo.id};
		    //deletes photo from gallery and moves or hides slider
		    main.getUI().getTools().deletePhoto(photo);
		}
		else 
		    return;
	    }

	    else if (instance.$delete.hasClass(".mp-element-place")){
		if(confirm("Do you really want to delete place "+place.name)){
		    url = "/delete-place";
		    data = {"id":place.id};
		    place._delete();
		    main.getUI().getInformation().setInfo();
		}
		else
		    return;
	    }
	    /*
	    else if (instance.$delete.hasClass(".mp-element-place")) {
		if(confirm("Do you really want to delete place "+place.name)){
		    url = "/delete-album";
		    data = {"id":album.id};
		    album._delete();
		    main.getUI().getInformation().setInfo();
		}
		else
		    return;
	    }*/
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

	this.$modify.bind("click.MapPhotoAlbum",function(event){
	    var state = main.getUIState();	
	    var place = state.getCurrentPlace();
	    var photo = state.getCurrentPhoto();
	    //slider is activated edit current picture
	    if (state.isSlideshow()) {

		main.getUI().getInput()
		    .onLoad(function(){
			//prefill with values from selected picture
			$("input[name=id]").val(photo.id);
			$("input[name=order]").val(photo.order);
			var $name = $("input[name=title]").val(photo.name);
			var $desc = $("textarea[name=description]").val(photo.desc);

			//reflect changes locally when form is valid and ready to be send
			main.getUI().getInput().onForm(function(){
			    photo.name = $name.val();
			    photo.desc = $desc.val();
			    main.getUI().getInformation().setInfo({
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

		main.getUI().getInput()
		    .onLoad(function(){
			$("input[name=id]").val(place.id);
			var $name = $("input[name=title]").val(place.name);
			var $desc = $("textarea[name=description]").val(place.desc);

			main.getUI().getInput().onForm(function(){
			    //reflect changes locally
			    place.name = $name.val();
			    place.desc = $desc.val();
			    main.getUI().getInformation().setInfo(place);
			})
		    })
		    .get("/update-place");
	    }
	});
	//commit in iframe because of img upload
	this.$add.bind("click.MapPhotoAlbum",function(event){
	    place = main.getUIState().getCurrentPlace();
	    // reset load function 
	    main.getUI().getInput().iFrame("/insert-photo?place="+place.id);
	});
	this.$center.bind("click.MapPhotoAlbum",function(event){
	    var place = main.getUIState().getCurrentPlace();
	    if (place){
		place.center();
	    }
	});
    },

    

};
