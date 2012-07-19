UIControls = function(maxHeight) {

    this.$controls = $('.mp-controls');
    this.$controls.height(maxHeight);

    this.$delete = this.$controls.find(".mp-option-delete").hide();
    this.$modify = this.$controls.find(".mp-option-modify").hide();
    this.$add = this.$controls.find(".mp-option-add").hide();
    this.$logout = this.$controls.find(".mp-option-logout").show();
    this.$center = $(".mp-option-center").hide();
    this.bindListener();

};

UIControls.prototype = {
    
    init : function(){
	this.repositionCenterControl();
    },

    hideControls : function(){
	var instance = this;
	instance.$delete.hide();
	instance.$modify.hide()
	instance.$add.hide();
	instance.$center.hide();
    },

    showControls : function(){
	if(main.getClientState().isAdmin()){
    	    this.$delete.show();
	    this.$modify.show();
	    this.$add.show();
	}
	this.$center.show();
    },
    
    repositionCenterControl : function(){
	$centerElement = this.$center.show();
	console.log($centerElement);
	position = $("#mp-map").position();
	position.top += $("#mp-header").height() * 0.5
	position.left += 5;
	console.log(position);
	$centerElement.css('top',position.top).css('left',position.left);
	$centerElement.hide()
    },

    bindListener : function(){	

	var instance = this;
	this.$delete.bind("click.MapPhotoAlbum",function(event){
	    // hide current place's markers and clean photos from gallery
	    state = main.getUIState();	
	    place = state.getCurrentPlace();
	    photo = state.getCurrentPhoto(); 
	    var url,data;
	    
	    
	    if (state.isSlideshow()) {
		if(confirm("Do you really want to delete photo "+photo.name)){
		    url = "/delete-photo",
		    data = {"id":photo.id};
		    //deletes photo from gallery and moves or hides slider
		    main.getUI().getTools().deletePhoto(photo);
		}
		else 
		    return;
	    }

	    else{
		if(confirm("Do you really want to delete place "+place.name)){
		    url = "/delete-place";
		    data = {"id":place.id};
		    place._delete();
		    main.getUI().getControls().hideControls();
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
