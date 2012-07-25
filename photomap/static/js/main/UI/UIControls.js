UIControls = function(maxHeight) {

    this.$controls = $('.mp-controls');
    this.$controls.height(maxHeight);


    
    //currently photo only
    this.$photoControls = $(".mp-photo-controls-wrapper");
    this.$photoControls.hide();
    this.$delete = $("img.mp-option-delete");
    this.$update = $("img.mp-option-modify");

    this.$delete = $(".mp-option-delete");
    this.$modify = $(".mp-option-modify");
    this.$logout = $(".mp-option-logout");
    this.$center = $(".mp-option-center");

    
    this.bindListener();

};

UIControls.prototype = {
    
    init : function(){
	this.placeCenterControl();
	this.bindListener();

	height = main.getUI().getPanel().getFooterHeight();
	this.$logout.height(height);

    },
    

    hideControls : function(){
	// instance.$delete.hide();
	// instance.$update.hide()
	this.$insert.parent().hide();
	this.$center.hide();
    },

    showControls : function(){
	if(main.getClientState().isAdmin()){
    	    // this.$delete.show();
	    // this.$modify.show();
	    // this.$insert.parent().show();
	}
	this.$center.show();
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
      displays modify control under a photo
      @param $el: the photo element under which controls are placed
    */
    showPhotoControls : function($el){
	center = $el.offset();
	tools = main.getUI().getTools();
	center.left += tools.getRealWidth($el)/2;
	center.top += tools.getRealHeight($el);


	this.showModifyControls(center);
	this.setModifyPhoto(true);

    },
    
    /*
      modify controls are instantiated once and are used for places and photos
      @param center: the bottom center of the element that is currently worked on
    */

    showModifyControls : function(center){
	// calculate the offset
	tools = main.getUI().getTools();
	center.left  -= tools.getRealWidth(this.$photoControls)/2;

	
	// höhe und breite muss man nur einmal setzten
	this.$photoControls
	    // .width(size.x)
	    // .height(size.y)
	    .offset(center)
	    .css("z-index",999999)
	    .show("show")
	    .find(".mp-photo-controls")
	    .height(this.$photoControls.height() * 0.8)
	    .width(this.$photoControls.width() * 0.45);
	
    },

    setModifyPlace : function(modifyPlace){
	this.isModifyPlace = modifyPlace;
	this.isModifyPhoto = !modifyPlace;
    },
    
    setModifyPhoto : function(modifyPhoto){
	this.isModifyPhoto = modifyPhoto;
	this.isModifyPlace = !modifyPhoto;
    },

    hidePhotoControls : function(){
	this.$photoControls.hide();
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
	this.$delete.bind("click.MapPhotoAlbum",function(event){
	    // hide current place's markers and clean photos from gallery
	    state = main.getUIState();	
	    photo = state.getCurrentPhoto();
	    place = state.getCurrentPlace();
	    var url,data;
	    
	    // delete current photo
	    if (instance.isModifyPhoto) {
		if(confirm("Do you really want to delete photo "+photo.name)){
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
		if(confirm("Do you really want to delete place "+place.name)){
		    url = "/delete-place";
		    data = {"id":place.id};
		    place._delete();
		    main.getUI().getInformation().setInfo();
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

	this.$update.bind("click.MapPhotoAlbum",function(event){
	    var state = main.getUIState();	
	    var place = state.getCurrentPlace();
	    var photo = state.getCurrentPhoto();
	    
	    // edit current photo
	    if (instance.isModifyPhoto) {

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
			    main.getUI().getInformation().setInfo(place);
			})
		    })
		    .get("/update-place");
	    }
	});
	

	
	this.$center.bind("click.MapPhotoAlbum",function(event){
	    var place = main.getUIState().getCurrentPlace();
	    if (place){
		place.center();
	    }
	});
    },

    

};